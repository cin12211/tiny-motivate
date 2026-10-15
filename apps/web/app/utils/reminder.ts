import { Capacitor } from '@capacitor/core'
import type { UserSettings } from '#shared/types'
import en from '~~/i18n/locales/en.json'
import vi from '~~/i18n/locales/vi.json'

const REMINDER_ID = 1001

/**
 * Daily "tick your goals" reminder. Uses native local notifications inside
 * the Capacitor app; the web build only stores the preference.
 * The permission prompt is only shown when `ask` is set (i.e. the user
 * touched the reminder in Settings), never on app launch.
 */
export async function scheduleReminder(settings: Pick<UserSettings, 'notify' | 'time' | 'lang'>, ask = false) {
  if (import.meta.server || !Capacitor.isNativePlatform()) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] })
    if (!settings.notify) return
    const perm = ask ? await LocalNotifications.requestPermissions() : await LocalNotifications.checkPermissions()
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
