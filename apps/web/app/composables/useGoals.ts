import type { CreateGoalInput, Goal, Reward, UpdateDayInput } from '#shared/types'
import { addDays, dayNumberOf, parseISODate } from '#shared/utils/dates'

/** Shared goal list backed by the Nitro JSON API. */
export function useGoals() {
  const goals = useState<Goal[]>('goals', () => [])
  const loaded = useState('goals-loaded', () => false)

  async function refresh() {
    goals.value = await useApi()<Goal[]>('/api/goals')
    loaded.value = true
  }

  async function ensureLoaded() {
    if (!loaded.value) await refresh()
  }

  function reset() {
    goals.value = []
    loaded.value = false
  }

  function replace(goal: Goal) {
    const i = goals.value.findIndex(g => g.id === goal.id)
    if (i === -1) goals.value.unshift(goal)
    else goals.value.splice(i, 1, goal)
    return goal
  }

  async function create(input: CreateGoalInput) {
    return replace(await useApi()<Goal>('/api/goals', { method: 'POST', body: input }))
  }

  async function remove(id: string) {
    await useApi()(`/api/goals/${id}`, { method: 'DELETE' })
    goals.value = goals.value.filter(g => g.id !== id)
  }

  async function updateDay(id: string, day: number, input: UpdateDayInput) {
    return replace(await useApi()<Goal>(`/api/goals/${id}/days/${day}`, { method: 'PUT', body: input }))
  }

  async function openReward(id: string, rewardId: string) {
    return replace(await useApi()<Goal>(`/api/goals/${id}/rewards/${rewardId}/open`, { method: 'POST' }))
  }

  async function upload(file: File) {
    const form = new FormData()
    form.append('file', file)
    return useApi()<{ url: string }>('/api/uploads', { method: 'POST', body: form })
  }

  return { goals, loaded, refresh, ensureLoaded, reset, create, remove, updateDay, openReward, upload }
}

export type DayStatus = 'done' | 'today' | 'missed' | 'future'

/** Derived numbers for one goal: today's day number, completed days, streak, next reward… */
export function goalStats(goal: Goal) {
  const today = dayNumberOf(goal.startDate)
  const doneCount = Object.values(goal.days).filter(d => d.done).length
  const finished = today > goal.totalDays
  const active = today >= 1 && !finished

  // Streak: consecutive done days ending today (or yesterday if today isn't done yet).
  let streak = 0
  let n = Math.min(today, goal.totalDays)
  if (!goal.days[String(n)]?.done) n -= 1
  while (n >= 1 && goal.days[String(n)]?.done) {
    streak++
    n--
  }

  const rewards = [...goal.rewards].sort((a, b) => a.day - b.day)
  const unlocked = rewards.filter(r => doneCount >= r.day)
  const nextReward: Reward | undefined = rewards.find(r => doneCount < r.day)
  const daysToNext = nextReward ? nextReward.day - doneCount : 0
  const todayDone = !!goal.days[String(today)]?.done

  return { today, doneCount, finished, active, streak, rewards, unlocked, nextReward, daysToNext, todayDone }
}

export function dayStatus(goal: Goal, day: number): DayStatus {
  const today = dayNumberOf(goal.startDate)
  if (goal.days[String(day)]?.done) return 'done'
  if (day === today) return 'today'
  return day < today ? 'missed' : 'future'
}

export function dayDate(goal: Goal, day: number) {
  return addDays(goal.startDate, day - 1)
}

export function rewardAt(goal: Goal, day: number) {
  return goal.rewards.find(r => r.day === day)
}

/** Totals across every goal. */
export function overallStats(goals: Goal[]) {
  let bestStreak = 0
  let rewardsUnlocked = 0
  const pending: Goal[] = []
  for (const g of goals) {
    const s = goalStats(g)
    bestStreak = Math.max(bestStreak, s.streak)
    rewardsUnlocked += s.unlocked.length
    if (s.active && !s.todayDone) pending.push(g)
  }
  return { bestStreak, rewardsUnlocked, pending }
}

const pad = (n: number) => String(n).padStart(2, '0')

export const pad2 = (n: number) => pad(Math.max(0, n))
/** 0 (Sunday) .. 6 — translate with t(`weekdays.${i}`). */
export function weekdayIndex(iso: string) {
  return parseISODate(iso).getDay()
}
/** dd.mm.yyyy — the date chip format from the design. */
export function dotDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}
/** dd.mm */
export function dotShort(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}.${m}`
}
/** d/m */
export function slashShort(iso: string) {
  const [, m, d] = iso.split('-').map(Number)
  return `${d}/${m}`
}
