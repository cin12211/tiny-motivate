import { plantIconFor } from '@motivation/garden'
import type { Garden, Goal } from '#shared/types'
import { addDays } from '#shared/utils/dates'

/**
 * The user's garden, stored apart from goals (/api/garden): one plant per
 * ticked date with the icon that grew there. Deleting
 * a goal never takes plants out. Ticks update it optimistically; the server
 * copy is fetched again after each save.
 */
export function useGarden() {
  const garden = useState<Garden>('garden', () => ({ plants: [] }))
  const loaded = useState('garden-loaded', () => false)

  async function refresh() {
    garden.value = await useApi()<Garden>('/api/garden')
    loaded.value = true
  }
  let loading: Promise<void> | null = null
  async function ensureLoaded() {
    if (loaded.value) return
    loading ??= refresh().finally(() => (loading = null))
    await loading
  }
  function reset() {
    garden.value = { plants: [] }
    loaded.value = false
  }

  /** date → icon of the plant grown that day */
  const plantMap = computed(() => new Map(garden.value.plants.map(p => [p.date, p.icon])))

  /** Optimistic copy of what the server does after a goal day changes. */
  function applyDay(goals: Goal[], goal: Goal, day: number, change: { done: boolean }) {
    const date = addDays(goal.startDate, day - 1)
    const g = garden.value
    if (change.done === true && !plantMap.value.has(date)) {
      g.plants = [...g.plants, { date, icon: plantIconFor(g.plants.length, date) }].sort((a, b) => a.date.localeCompare(b.date))
    }
    else if (change.done === false) {
      const stillTicked = goals.some(o => o.days[String(Math.round((Date.parse(date) - Date.parse(o.startDate)) / 86_400_000) + 1)]?.done)
      if (!stillTicked) g.plants = g.plants.filter(p => p.date !== date)
    }
  }

  return { garden, loaded, plantMap, refresh, ensureLoaded, reset, applyDay }
}
