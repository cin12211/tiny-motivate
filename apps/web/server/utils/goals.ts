import { and, asc, eq, inArray } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type { CreateGoalInput, DayEntry, Goal, MoodId, UpdateDayInput } from '#shared/types'
import { dayNumberOf, toISODate } from '#shared/utils/dates'
import { schema, useDb } from '../db'

const { goal, goalDay, reward } = schema
const MOODS = new Set(['m1', 'm2', 'm3', 'm4', 'm5'])
const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null)

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
  await db.insert(goal).values({ id, userId, title, icon: body.icon || 'plant-01', totalDays, startDate })
  if (rewards.length) await db.insert(reward).values(rewards)
  await invalidate(goalsKey(userId))
  return getGoal(userId, id)
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
  const current = await getGoal(userId, goalId)
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

  await useDb().insert(goalDay)
    .values({ goalId, day, ...next, updatedAt: new Date() })
    .onConflictDoUpdate({ target: [goalDay.goalId, goalDay.day], set: { ...next, updatedAt: new Date() } })
  await invalidate(goalsKey(userId))
  return getGoal(userId, goalId)
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
