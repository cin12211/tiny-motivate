import { Capacitor } from '@capacitor/core'
import type { Goal, UserSettings } from '#shared/types'
import { addDays, dayNumberOf, parseISODate, toISODate } from '#shared/utils/dates'
// raw text: the i18n module compiles imported locale JSON into message
// functions, and the native plugin needs plain strings for title / body
import enRaw from '~~/i18n/locales/en.json?raw'
import viRaw from '~~/i18n/locales/vi.json?raw'

interface ReminderText { title: string, body: string, goal1: string, goal2: string, goal3: string, goal4: string }
const REMINDER_TEXT = {
  en: JSON.parse(enRaw).reminder as ReminderText,
  vi: JSON.parse(viRaw).reminder as ReminderText,
}
const textFor = (lang: string) => REMINDER_TEXT[lang === 'en' ? 'en' : 'vi']
const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))

const REMINDER_ID = 1001

/**
 * Daily "tick your goals" reminder. Uses native local notifications inside
 * the Capacitor app; the web build only stores the preference.
 * The reminder is on by default, so the system permission prompt shows the
 * first time it is needed (after sign-in, or when the user touches the
 * reminder in Settings with `ask`). Once answered, iOS / Android never ask
 * again; a "no" is only changed in the phone's settings.
 */
export async function scheduleReminder(settings: Pick<UserSettings, 'notify' | 'time' | 'lang'>, ask = false) {
  if (import.meta.server || !Capacitor.isNativePlatform()) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] })
    if (!settings.notify) return
    let perm = await LocalNotifications.checkPermissions()
    if (perm.display !== 'granted' && perm.display !== 'denied') perm = await LocalNotifications.requestPermissions()
    else if (ask && perm.display === 'denied') perm = await LocalNotifications.requestPermissions()
    if (perm.display !== 'granted') return
    const [hour, minute] = settings.time.split(':').map(Number)
    const text = REMINDER_TEXT[settings.lang === 'en' ? 'en' : 'vi']
    await LocalNotifications.schedule({
      notifications: [{
        id: REMINDER_ID,
        title: text.title,
        body: text.body,
        schedule: { on: { hour, minute }, allowWhileIdle: true },
      }],
    })
  }
  catch {}
}

/** True in the native app when the phone's settings block our notifications. */
export async function notificationsBlocked() {
  if (import.meta.server || !Capacitor.isNativePlatform()) return false
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    return (await LocalNotifications.checkPermissions()).display === 'denied'
  }
  catch {
    return false
  }
}

/* ---------- per-goal reminders (v60) ---------- */

/** Notification ids for goal reminders start here (the general reminder is 1001). */
const GOAL_ID_BASE = 2000
/** iOS keeps at most 64 pending notifications; leave room for the general one. */
const MAX_PENDING = 60
const MAX_DAYS_AHEAD = 14

/**
 * Body of a goal reminder for day `n` of the goal: one of the 4 approved
 * lines, picked at random (`pick` 0..3 to choose); line 3 (next reward) only
 * while a reward is still locked. Always a plain string (see 2026-10-20 bug).
 */
export function goalReminderBody(goal: Goal, lang: string, n: number, pick = Math.floor(Math.random() * 4)) {
  const t = textFor(lang)
  const s = goalStats(goal)
  const lines = [t.goal1, t.goal2, t.goal3, t.goal4]
  let i = pick % 4
  if (i === 2 && !s.nextReward) i = (i + 1) % 4
  return fill(lines[i]!, {
    goal: goal.title,
    n,
    total: goal.totalDays,
    x: s.daysToNext,
    reward: s.nextReward?.title ?? '',
  })
}

export const goalReminderTitle = (lang: string) => textFor(lang).title

/** The general reminder in Settings is on at the same time, so the goal's own is not sent. */
export const sameAsGeneral = (goal: Pick<Goal, 'remind'>, settings: Pick<UserSettings, 'notify' | 'time'>) =>
  !!goal.remind && settings.notify && goal.remind === settings.time

/**
 * Schedule every goal's own daily reminder: one notification per day at
 * `goal.remind`, only on the goal's days, never on a day already ticked, and
 * not when the general reminder fires at the same time. Re-run after any
 * change (create / edit / tick / settings / app open): it replaces everything
 * scheduled before. A rolling window of days is scheduled each time.
 */
export async function scheduleGoalReminders(goals: Goal[], settings: Pick<UserSettings, 'notify' | 'time' | 'lang'>) {
  if (import.meta.server || !Capacitor.isNativePlatform()) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const pending = await LocalNotifications.getPending()
    const old = pending.notifications.filter(n => n.id >= GOAL_ID_BASE)
    if (old.length) await LocalNotifications.cancel({ notifications: old.map(n => ({ id: n.id })) })

    const withRemind = goals.filter(g => g.remind && !sameAsGeneral(g, settings))
    if (!withRemind.length) return
    let perm = await LocalNotifications.checkPermissions()
    if (perm.display !== 'granted' && perm.display !== 'denied') perm = await LocalNotifications.requestPermissions()
    if (perm.display !== 'granted') return

    const perGoal = Math.max(1, Math.min(MAX_DAYS_AHEAD, Math.floor(MAX_PENDING / withRemind.length)))
    const today = toISODate()
    const now = Date.now()
    const notifications = []
    let id = GOAL_ID_BASE
    for (const g of withRemind) {
      const [hour, minute] = g.remind!.split(':').map(Number) as [number, number]
      let count = 0
      for (let k = 0; k <= MAX_DAYS_AHEAD && count < perGoal; k++) {
        const iso = addDays(today, k)
        const n = dayNumberOf(g.startDate, iso)
        if (n < 1) continue
        if (n > g.totalDays) break
        if (g.days[String(n)]?.done) continue
        const at = parseISODate(iso)
        at.setHours(hour, minute, 0, 0)
        if (at.getTime() <= now) continue
        notifications.push({
          id: id++,
          title: goalReminderTitle(settings.lang),
          body: goalReminderBody(g, settings.lang, n),
          schedule: { at, allowWhileIdle: true },
          extra: { goalId: g.id },
        })
        count++
      }
    }
    if (notifications.length) await LocalNotifications.schedule({ notifications })
  }
  catch {}
}
