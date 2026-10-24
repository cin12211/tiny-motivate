import { watchDebounced } from '@vueuse/core'

/**
 * iOS home-screen widget: keep its snapshot in step with the goals and
 * settings, and pick up ticks made on the widget when the app comes back.
 */
export default defineNuxtPlugin(() => {
  if (!widgetSupported()) return
  const { public: { apiBase } } = useRuntimeConfig()
  const { token } = useToken()
  const { goals, loaded, refresh } = useGoals()
  const { settings } = useSettings()
  const { garden } = useGarden()

  watchDebounced([token, goals, loaded, settings, garden], () => {
    if (!token.value) return saveWidget(null)
    if (!loaded.value) return
    let jwt: string | null = null
    try {
      jwt = localStorage.getItem('motivation-jwt')
    }
    catch {}
    saveWidget(widgetSnapshot(goals.value, garden.value, settings.value, { apiBase, token: token.value, jwt }))
  }, { debounce: 400, deep: true })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && token.value && loaded.value) Promise.all([refresh(), useGarden().refresh()]).catch(() => {})
  })
})
