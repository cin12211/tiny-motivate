import { Capacitor } from '@capacitor/core'
import type { UserSettings } from '#shared/types'
import en from '~~/i18n/locales/en.json'
import vi from '~~/i18n/locales/vi.json'

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
    const text = (settings.lang === 'en' ? en : vi).reminder
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
