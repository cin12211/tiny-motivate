import { and, asc, eq, inArray } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type { CreateGoalInput, DayEntry, Goal, MoodId, UpdateDayInput, UpdateGoalInput } from '#shared/types'
import { addDays, dayNumberOf, toISODate } from '#shared/utils/dates'
import { schema, useDb } from '../db'

const { goal, goalDay, reward } = schema
const MOODS = new Set(['m1', 'm2', 'm3', 'm4', 'm5'])
const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null)
const isTime = (v: unknown): v is string => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v)

const goalsKey = (userId: string) => `goals:${userId}`
const GOALS_TTL = 300

/** All of a user's goals, cached for a few minutes (invalidated on every write). */
export function listGoals(userId: string): Promise<Goal[]> {
  return cached(goalsKey(userId), GOALS_TTL, () => loadGoals(userId))
}

/** Load goals (with rewards and days) in the shape the app uses. */
export async function loadGoals(userId: string, goalId?: string): Promise<Goal[]> {
  const db = useDb()
  const goals = await db.select().from(goal)
    .where(goalId ? and(eq(goal.userId, userId), eq(goal.id, goalId)) : eq(goal.userId, userId))
    .orderBy(asc(goal.createdAt))
  if (!goals.length) return []
  const ids = goals.map(g => g.id)
  const [rewards, days] = await Promise.all([
    db.select().from(reward).where(inArray(reward.goalId, ids)).orderBy(asc(reward.day)),
    db.select().from(goalDay).where(inArray(goalDay.goalId, ids)),
  ])
  return goals.reverse().map(g => ({
    id: g.id,
    userId: g.userId,
    title: g.title,
    icon: g.icon,
    totalDays: g.totalDays,
    startDate: g.startDate,
    remind: g.remind ?? null,
    createdAt: g.createdAt.toISOString(),
    rewards: rewards.filter(r => r.goalId === g.id).map(r => ({
      id: r.id, day: r.day, title: r.title, icon: r.icon, image: r.image, openedAt: iso(r.openedAt),
    })),
    days: Object.fromEntries(days.filter(d => d.goalId === g.id).map(d => [String(d.day), {
      journal: d.journal, mood: d.mood as MoodId | null, done: d.done, doneAt: iso(d.doneAt), updatedAt: d.updatedAt.toISOString(),
    } satisfies DayEntry])),
  }))
}

export async function getGoal(userId: string, goalId: string): Promise<Goal> {
  const [found] = await loadGoals(userId, goalId)
  if (!found) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy mục tiêu' })
  return found
}

export async function createGoal(userId: string, body: CreateGoalInput): Promise<Goal> {
  const title = body?.title?.trim()
  const totalDays = Math.floor(Number(body?.totalDays))
  const startDate = body?.startDate || toISODate()
  if (!title) throw createError({ statusCode: 400, statusMessage: 'Cần đặt tên cho mục tiêu' })
  if (!Number.isFinite(totalDays) || totalDays < 1 || totalDays > 365)
    throw createError({ statusCode: 400, statusMessage: 'Số ngày phải từ 1 đến 365' })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate))
    throw createError({ statusCode: 400, statusMessage: 'Ngày bắt đầu không hợp lệ' })

  const id = nanoid(10)
  const rewards = (body.rewards ?? [])
    .filter(r => r.title?.trim())
    .map(r => ({
      id: nanoid(8),
      goalId: id,
      day: Math.min(totalDays, Math.max(1, Math.floor(Number(r.day)))),
      title: r.title.trim(),
      icon: r.icon || 'gift',
      image: r.image || null,
    }))

  const db = useDb()
  const remind = isTime(body.remind) ? body.remind : null
  await db.insert(goal).values({ id, userId, title, icon: body.icon || 'plant-01', totalDays, startDate, remind })
  if (rewards.length) await db.insert(reward).values(rewards)
  await invalidate(goalsKey(userId))
  return getGoal(userId, id)
}

/**
 * Change a goal (v72 edit screen; the detail page sends only `remind`).
 * Rules, the same as the form: rewards already received (ticked days ≥ their
 * day) stay exactly as they are; other milestones start after the days done;
 * the goal can't get shorter than max(3, days done, last received reward).
 */
export async function updateGoal(userId: string, goalId: string, body: UpdateGoalInput): Promise<Goal> {
  const current = await getGoal(userId, goalId)
  const set: Partial<typeof goal.$inferInsert> = {}

  if (body?.remind !== undefined) {
    if (body.remind !== null && !isTime(body.remind)) throw createError({ statusCode: 400, statusMessage: 'Giờ nhắc không hợp lệ' })
    set.remind = body.remind
  }
  if (body?.title !== undefined) {
    const title = String(body.title).trim()
    if (!title) throw createError({ statusCode: 400, statusMessage: 'Cần đặt tên cho mục tiêu' })
    set.title = title.slice(0, 80)
  }
  if (body?.icon !== undefined) set.icon = String(body.icon) || current.icon

  const ticked = Object.values(current.days).filter(d => d.done).length
  const lastTicked = Math.max(0, ...Object.entries(current.days).filter(([, d]) => d.done).map(([n]) => Number(n)))
  const received = current.rewards.filter(r => r.day <= ticked)
  const totalDays = body?.totalDays !== undefined ? Math.floor(Number(body.totalDays)) : current.totalDays
  const minDays = Math.max(3, ticked, lastTicked, ...received.map(r => r.day))
  if (!Number.isFinite(totalDays) || totalDays > 365)
    throw createError({ statusCode: 400, statusMessage: 'Số ngày phải từ 1 đến 365' })
  if (totalDays < minDays)
    throw createError({ statusCode: 400, statusMessage: `Bạn đã làm được ${ticked} ngày nên không giảm dưới ${minDays} ngày.` })
  if (body?.totalDays !== undefined) set.totalDays = totalDays

  let rewards: (typeof reward.$inferInsert)[] | undefined
  if (body?.rewards) {
    const keep = new Set(received.map(r => r.id))
    const mine = new Set(current.rewards.map(r => r.id))
    rewards = body.rewards
      .filter(r => !(r.id && keep.has(r.id)) && r.title?.trim())
      .map((r) => {
        const day = Math.floor(Number(r.day))
        if (!Number.isFinite(day) || day < ticked + 1 || day > totalDays)
          throw createError({ statusCode: 400, statusMessage: `Bạn đã làm được ${ticked} ngày, chặng mới phải từ ngày ${ticked + 1} trở đi.` })
        return { id: r.id && mine.has(r.id) ? r.id : nanoid(8), goalId, day, title: r.title.trim().slice(0, 60), icon: r.icon || 'gift', image: r.image || null }
      })
  }

  const db = useDb()
  if (Object.keys(set).length) await db.update(goal).set(set).where(and(eq(goal.id, goalId), eq(goal.userId, userId)))
  if (rewards) {
    // received rewards are never touched; the open ones are replaced by the new list
    const open = current.rewards.filter(r => r.day > ticked).map(r => r.id)
    if (open.length) await db.delete(reward).where(inArray(reward.id, open))
    if (rewards.length) await db.insert(reward).values(rewards)
  }
  await invalidate(goalsKey(userId))
  return getGoal(userId, goalId)
}

export async function deleteGoal(userId: string, goalId: string) {
  const deleted = await useDb().delete(goal).where(and(eq(goal.id, goalId), eq(goal.userId, userId))).returning({ id: goal.id })
  if (!deleted.length) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy mục tiêu' })
  await invalidate(goalsKey(userId))
}

/**
 * Save the journal / mood for a day and/or tick it done.
 * Ticking "done" is only allowed for today — that's the core rule of the app.
 */
export async function updateDay(userId: string, goalId: string, day: number, body: UpdateDayInput): Promise<Goal> {
  // read from the cached goal list (the app ticks often; no need to hit the DB twice)
  const current = (await listGoals(userId)).find(g => g.id === goalId) ?? await getGoal(userId, goalId)
  if (!Number.isInteger(day) || day < 1 || day > current.totalDays)
    throw createError({ statusCode: 400, statusMessage: 'Ngày không hợp lệ' })
  const today = dayNumberOf(current.startDate)
  if (day > today) throw createError({ statusCode: 403, statusMessage: 'Chưa tới ngày này' })

  const prev = current.days[String(day)]
  const next = {
    journal: prev?.journal ?? '',
    mood: (prev?.mood ?? null) as MoodId | null,
    done: prev?.done ?? false,
    doneAt: prev?.doneAt ? new Date(prev.doneAt) : null,
  }
  if (typeof body?.journal === 'string') next.journal = body.journal
  if (body?.mood === null || (typeof body?.mood === 'string' && MOODS.has(body.mood))) next.mood = body.mood ?? null
  if (typeof body?.done === 'boolean' && body.done !== next.done) {
    if (day !== today) throw createError({ statusCode: 403, statusMessage: 'Chỉ tick hoàn thành được cho hôm nay' })
    next.done = body.done
    next.doneAt = body.done ? new Date() : null
  }

  const updatedAt = new Date()
  await useDb().insert(goalDay)
    .values({ goalId, day, ...next, updatedAt })
    .onConflictDoUpdate({ target: [goalDay.goalId, goalDay.day], set: { ...next, updatedAt } })
  await Promise.all([
    invalidate(goalsKey(userId)),
    // the garden lives apart from goals (deleting a goal keeps its plants)
    next.done !== (prev?.done ?? false) ? syncGardenDay(userId, addDays(current.startDate, day - 1), next.done) : undefined,
  ])
  // answer with the goal as it is now, without reading it back from the DB
  return {
    ...current,
    days: { ...current.days, [String(day)]: { journal: next.journal, mood: next.mood, done: next.done, doneAt: next.doneAt ? next.doneAt.toISOString() : null, updatedAt: updatedAt.toISOString() } },
  }
}

/** Mark an unlocked reward as opened (the "open gift" moment). */
export async function openReward(userId: string, goalId: string, rewardId: string): Promise<Goal> {
  const current = await getGoal(userId, goalId)
  const r = current.rewards.find(x => x.id === rewardId)
  if (!r) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy phần thưởng' })
  const doneCount = Object.values(current.days).filter(d => d.done).length
  if (doneCount < r.day) throw createError({ statusCode: 403, statusMessage: 'Phần thưởng chưa mở khoá' })
  if (!r.openedAt) {
    await useDb().update(reward).set({ openedAt: new Date() }).where(eq(reward.id, rewardId))
    await invalidate(goalsKey(userId))
  }
  return getGoal(userId, goalId)
}
