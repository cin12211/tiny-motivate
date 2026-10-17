/** Register the service worker (installable web app + offline shell). Web production only. */
export default defineNuxtPlugin(() => {
  const { public: { mobile } } = useRuntimeConfig()
  if (mobile || import.meta.dev || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
})
