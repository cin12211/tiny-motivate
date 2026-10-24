import { Capacitor, registerPlugin } from '@capacitor/core'
import { plantIconFor } from '@motivation/garden'
import type { Garden, Goal, UserSettings } from '#shared/types'
import { ACCENTS } from '#shared/utils/settings'
import { addDays, toISODate } from '#shared/utils/dates'

/** Native plugin defined in apps/mobile/ios/App/App/AppDelegate.swift. */
const Widget = registerPlugin<{ save: (opts: { json?: string }) => Promise<void> }>('Widget')

export const widgetSupported = () => !import.meta.server && Capacitor.getPlatform() === 'ios'

/**
 * Data for the iOS home-screen widget (ios/App/TinyMotivateWidget): running
 * goals with today's tick, the streak, the garden around today and the look.
 * The widget's tick button calls the API itself, so it also gets the API base
 * and the session token.
 */
export function widgetSnapshot(goals: Goal[], garden: Garden, settings: UserSettings, auth: { apiBase: string, token: string, jwt: string | null }) {
  const today = toISODate()
  // plants come from the garden (kept apart from goals)
  const plants = new Map(garden.plants.map(p => [p.date, p.icon]))
  const accent = ACCENTS[settings.accent] ?? ACCENTS[0]!

  const running = goals
    .map(g => ({ g, s: goalStats(g) }))
    .filter(({ s }) => s.active)
    .map(({ g, s }) => ({
      id: g.id,
      title: g.title,
      icon: g.icon,
      day: s.today,
      totalDays: g.totalDays,
      doneCount: s.doneCount,
      done: s.todayDone,
      rewardTitle: s.nextReward?.title,
      rewardIn: s.nextReward ? s.daysToNext : undefined,
    }))

  // days in a row with a tick, ending yesterday (the widget adds today itself)
  let streakBase = 0
  for (let d = addDays(today, -1); plants.has(d); d = addDays(d, -1)) streakBase++

  // today − 39 … today + 31: the whole current month (large widget), and the
  // widget can move on into the next month by itself
  // a day not grown yet shows the icon it would grow next
  const next = (d: string) => plantIconFor(garden.plants.filter(p => p.date < d).length, d)
  const cells = Array.from({ length: 71 }, (_, i) => {
    const d = addDays(today, i - 39)
    return { d, i: plants.get(d) ?? next(d), done: d < today && plants.has(d) }
  })

  return {
    date: today,
    lang: settings.lang,
    theme: settings.theme,
    accentLight: accent.light,
    accentDark: accent.dark,
    ...auth,
    goals: running,
    streakBase,
    garden: cells,
  }
}

/** Write the snapshot (or clear it after sign-out) and redraw the widgets. */
export async function saveWidget(snapshot: ReturnType<typeof widgetSnapshot> | null) {
  if (!widgetSupported()) return
  try {
    await Widget.save({ json: snapshot ? JSON.stringify(snapshot) : undefined })
  }
  catch {}
}
