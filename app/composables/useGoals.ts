import type { CreateGoalInput, Goal, Reward, UpdateDayInput } from '#shared/types'
import { addDays, dayNumberOf } from '#shared/utils/dates'

/** Shared, SSR-friendly goal list backed by the Nitro JSON API. */
export function useGoals() {
  const goals = useState<Goal[]>('goals', () => [])
  const loaded = useState('goals-loaded', () => false)

  async function refresh() {
    goals.value = await $fetch<Goal[]>('/api/goals')
    loaded.value = true
  }

  async function ensureLoaded() {
    if (!loaded.value) await refresh()
  }

  function replace(goal: Goal) {
    const i = goals.value.findIndex(g => g.id === goal.id)
    if (i === -1) goals.value.unshift(goal)
    else goals.value.splice(i, 1, goal)
    return goal
  }

  async function create(input: CreateGoalInput) {
    return replace(await $fetch<Goal>('/api/goals', { method: 'POST', body: input }))
  }

  async function remove(id: string) {
    await $fetch(`/api/goals/${id}`, { method: 'DELETE' })
    goals.value = goals.value.filter(g => g.id !== id)
  }

  async function updateDay(id: string, day: number, input: UpdateDayInput) {
    return replace(await $fetch<Goal>(`/api/goals/${id}/days/${day}`, { method: 'PUT', body: input }))
  }

  async function openReward(id: string, rewardId: string) {
    return replace(await $fetch<Goal>(`/api/goals/${id}/rewards/${rewardId}/open`, { method: 'POST' }))
  }

  async function upload(file: File) {
    const form = new FormData()
    form.append('file', file)
    return $fetch<{ url: string }>('/api/uploads', { method: 'POST', body: form })
  }

  return { goals, loaded, refresh, ensureLoaded, create, remove, updateDay, openReward, upload }
}

export type DayStatus = 'done' | 'today' | 'missed' | 'future'

/** Derived numbers for one goal: today's day number, completed days, streak, next reward… */
export function goalStats(goal: Goal) {
  const today = dayNumberOf(goal.startDate)
  const doneCount = Object.values(goal.days).filter(d => d.done).length
  const finished = today > goal.totalDays

  // Streak: consecutive done days ending today (or yesterday if today isn't done yet).
  let streak = 0
  let n = Math.min(today, goal.totalDays)
  if (!goal.days[String(n)]?.done) n -= 1
  while (n >= 1 && goal.days[String(n)]?.done) {
    streak++
    n--
  }

  const unlocked = goal.rewards.filter(r => doneCount >= r.day)
  const nextReward: Reward | undefined = goal.rewards.find(r => doneCount < r.day)
  const daysToNext = nextReward ? nextReward.day - doneCount : 0
  const todayDone = !!goal.days[String(today)]?.done
  const percent = Math.round((doneCount / goal.totalDays) * 100)

  return { today, doneCount, finished, streak, unlocked, nextReward, daysToNext, todayDone, percent }
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

/** Totals across every goal — used by the top stats bar / sidebar. */
export function overallStats(goals: Goal[]) {
  let bestStreak = 0
  let rewardsUnlocked = 0
  let todayLeft = 0
  for (const g of goals) {
    const s = goalStats(g)
    bestStreak = Math.max(bestStreak, s.streak)
    rewardsUnlocked += s.unlocked.length
    if (!s.finished && s.today >= 1 && !s.todayDone) todayLeft++
  }
  const active = goals.filter(g => !goalStats(g).finished).length
  return { bestStreak, rewardsUnlocked, active, todayLeft }
}

/** Icons offered in the goal / reward pickers (Hugeicons names). */
export const GOAL_ICONS = [
  'book-open-01', 'dumbbell-01', 'running-shoes', 'yoga-01', 'brain-02', 'plant-01',
  'music-note-01', 'guitar', 'coffee-01', 'moon-02', 'sun-03', 'target-02',
]

export const REWARD_ICONS = [
  'gift', 'bubble-tea-01', 'restaurant-01', 'pizza-01', 'ice-cream-01', 'airplane-01',
  'books-01', 'film-roll-01', 'game-controller-03', 'headphones', 'shopping-bag-02', 'camera-01',
  'laptop', 'champion',
]

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
export function weekdayShort(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return WEEKDAYS[new Date(y!, m! - 1, d!).getDay()]
}
export function shortDate(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}
