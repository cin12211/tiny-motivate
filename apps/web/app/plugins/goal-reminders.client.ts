import { watchDebounced } from '@vueuse/core'

/**
 * Per-goal reminders (v60): reschedule them whenever the goals or the
 * settings change (create, edit, tick, general reminder time) and when the
 * app opens or comes back to the foreground (a new day moves the window on).
 */
export default defineNuxtPlugin(() => {
  const { token } = useToken()
  const { goals, loaded } = useGoals()
  const { settings } = useSettings()

  const sync = () => {
    if (!token.value) scheduleGoalReminders([], settings.value) // signed out: clear them
    else if (loaded.value) scheduleGoalReminders(goals.value, settings.value)
  }
  watchDebounced(
    () => [token.value, loaded.value, settings.value.notify, settings.value.time, settings.value.lang,
      goals.value.map(g => `${g.id}|${g.remind}|${g.startDate}|${g.totalDays}|${Object.entries(g.days).filter(([, d]) => d.done).map(([k]) => k).join(',')}`).join(';')],
    sync,
    { debounce: 600 },
  )
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') sync()
  })
})
