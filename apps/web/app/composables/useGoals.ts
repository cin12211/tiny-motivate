import type { CreateGoalInput, Goal, Reward, UpdateDayInput, UpdateGoalInput } from '#shared/types'
import { addDays, dayNumberOf, parseISODate } from '#shared/utils/dates'

/** Shared goal list backed by the Nitro JSON API. */
export function useGoals() {
  const goals = useState<Goal[]>('goals', () => [])
  const loaded = useState('goals-loaded', () => false)

  async function refresh() {
    goals.value = await useApi()<Goal[]>('/api/goals')
    loaded.value = true
  }

  // one request in flight at a time (the start-up fetch and the layout share it)
  let loading: Promise<void> | null = null
  async function ensureLoaded() {
    if (loaded.value) return
    loading ??= refresh().finally(() => (loading = null))
    await loading
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

  /** Optimistic: gone from the list at once, put back where it was if the server says no. */
  async function remove(id: string) {
    const at = goals.value.findIndex(g => g.id === id)
    const gone = goals.value[at]
    goals.value = goals.value.filter(g => g.id !== id)
    try {
      await useApi()(`/api/goals/${id}`, { method: 'DELETE' })
    }
    catch (err) {
      if (gone && !goals.value.some(g => g.id === id)) goals.value = [...goals.value.slice(0, at), gone, ...goals.value.slice(at)]
      throw err
    }
  }

  /**
   * Optimistic: the change shows up at once (the patch is applied before the
   * first await) and never waits for the network.
   * - Saves of the same goal go out one after another, so the server sees
   *   them in the order they were made (tick, untick, tick…).
   * - Only the answer to the latest change is applied; older answers would
   *   flash an outdated state.
   * - A failed save puts the goal back the way it was before that change
   *   (unless a newer change came after it), then rethrows.
   */
  const queues = new Map<string, Promise<unknown>>()
  const latest = new Map<string, number>()
  let seq = 0
  function optimistic(id: string, patch: (g: Goal) => void, send: () => Promise<Goal>) {
    const before = goals.value.find(g => g.id === id)
    if (before) {
      const draft: Goal = structuredClone(toRaw(before))
      patch(draft)
      replace(draft)
    }
    const mine = ++seq
    latest.set(id, mine)
    const run = (queues.get(id) ?? Promise.resolve()).catch(() => {}).then(send)
    queues.set(id, run)
    return run.then((goal) => {
      if (latest.get(id) === mine) replace(goal)
      return goal
    }, (err) => {
      if (before && latest.get(id) === mine) replace(before)
      throw err
    })
  }

  /** the garden follows ticks: optimistic now, the server copy once saved */
  function syncGarden(id: string, day: number, done: boolean | undefined, saving: Promise<unknown>) {
    const goal = goals.value.find(g => g.id === id)
    if (!goal || done === undefined) return
    const garden = useGarden()
    garden.applyDay(goals.value, goal, day, { done })
    saving.finally(() => garden.refresh().catch(() => {}))
  }

  function updateDay(id: string, day: number, input: UpdateDayInput) {
    const saving = optimistic(id, (g) => {
      const prev = g.days[String(day)]
      g.days[String(day)] = {
        journal: input.journal ?? prev?.journal ?? '',
        mood: input.mood !== undefined ? input.mood : prev?.mood ?? null,
        done: input.done ?? prev?.done ?? false,
        doneAt: input.done === undefined ? prev?.doneAt ?? null : input.done ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      }
    }, () => useApi()<Goal>(`/api/goals/${id}/days/${day}`, { method: 'PUT', body: input }))
    syncGarden(id, day, input.done, saving)
    return saving
  }

  /**
   * Journal / mood only: edits the day in place (no new goal object, so the
   * rest of the page doesn't re-render while typing) and ignores the echo from
   * the server; a failed save puts the old values back.
   */
  async function patchDay(id: string, day: number, input: Pick<UpdateDayInput, 'journal' | 'mood'>) {
    const g = goals.value.find(x => x.id === id)
    const key = String(day)
    const prev = g?.days[key]
    const before = prev && { journal: prev.journal, mood: prev.mood }
    if (g && prev) {
      if (input.journal !== undefined) prev.journal = input.journal
      if (input.mood !== undefined) prev.mood = input.mood
    }
    else if (g) {
      g.days[key] = { journal: input.journal ?? '', mood: input.mood ?? null, done: false, doneAt: null, updatedAt: new Date().toISOString() }
    }
    const send = useApi()<Goal>(`/api/goals/${id}/days/${day}`, { method: 'PUT', body: input })
    try {
      await send
    }
    catch (err) {
      const cur = g?.days[key]
      if (cur && before) Object.assign(cur, before)
      else if (g && !prev) delete g.days[key]
      throw err
    }
  }

  /** Change the goal's own reminder time (optimistic). */
  function updateGoal(id: string, input: UpdateGoalInput) {
    return optimistic(id, (g) => {
      if (input.remind !== undefined) g.remind = input.remind
      if (input.title !== undefined) g.title = input.title
      if (input.icon !== undefined) g.icon = input.icon
      if (input.totalDays !== undefined) g.totalDays = input.totalDays
      if (input.rewards) {
        // received rewards stay (the server keeps them too); the rest follow the list
        const { doneCount } = goalStats(g)
        const kept = g.rewards.filter(r => r.day <= doneCount)
        const old = new Map(g.rewards.map(r => [r.id, r]))
        g.rewards = [...kept, ...input.rewards
          .filter(r => !r.id || !kept.some(k => k.id === r.id))
          .map(r => ({ id: r.id ?? `tmp-${Math.random().toString(36).slice(2, 8)}`, day: r.day, title: r.title, icon: r.icon, image: r.image, openedAt: (r.id && old.get(r.id)?.openedAt) || null }))]
          .sort((a, b) => a.day - b.day)
      }
    }, () => useApi()<Goal>(`/api/goals/${id}`, { method: 'PATCH', body: input }))
  }

  function openReward(id: string, rewardId: string) {
    return optimistic(id, (g) => {
      const r = g.rewards.find(x => x.id === rewardId)
      if (r && !r.openedAt) r.openedAt = new Date().toISOString()
    }, () => useApi()<Goal>(`/api/goals/${id}/rewards/${rewardId}/open`, { method: 'POST' }))
  }

  async function upload(file: File) {
    const form = new FormData()
    form.append('file', file)
    return useApi()<{ url: string }>('/api/uploads', { method: 'POST', body: form })
  }

  return { goals, loaded, refresh, ensureLoaded, reset, create, remove, updateDay, patchDay, updateGoal, openReward, upload }
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

/** Precomputed map of ISO dates to number of completed goals on that date. */
export function goalsDoneDateMap(goals: Goal[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const g of goals) {
    for (const [kStr, entry] of Object.entries(g.days)) {
      if (entry?.done) {
        const k = Number(kStr)
        if (k >= 1 && k <= g.totalDays) {
          const iso = addDays(g.startDate, k - 1)
          map.set(iso, (map.get(iso) || 0) + 1)
        }
      }
    }
  }
  return map
}

export function rewardAt(goal: Goal, day: number) {
  return goal.rewards.find(r => r.day === day)
}

/**
 * Longest run of calendar days in a row with at least one tick, ever. The
 * garden keeps one plant per ticked day (deleted goals included), so it is
 * the record; the goals' own ticks fill in until the garden has loaded.
 */
export function longestStreak(goals: Goal[], plantDates: Iterable<string> = []) {
  const days = new Set(plantDates)
  for (const g of goals) {
    for (const [n, d] of Object.entries(g.days)) {
      if (d.done) days.add(addDays(g.startDate, Number(n) - 1))
    }
  }
  let best = 0
  for (const d of days) {
    if (days.has(addDays(d, -1))) continue // not the start of a run
    let run = 1
    while (days.has(addDays(d, run))) run++
    best = Math.max(best, run)
  }
  return best
}

/** Totals across every goal (pass the garden's plant dates for the longest streak). */
export function overallStats(goals: Goal[], plantDates?: Iterable<string>) {
  const bestStreak = longestStreak(goals, plantDates)
  let rewardsUnlocked = 0
  const pending: Goal[] = []
  for (const g of goals) {
    const s = goalStats(g)
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
