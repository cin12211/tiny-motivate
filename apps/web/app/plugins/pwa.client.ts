/** Register the service worker (installable web app + offline shell). Web production only. */
export default defineNuxtPlugin(() => {
  const { public: { mobile } } = useRuntimeConfig()
  if (mobile || import.meta.dev || !('serviceWorker' in navigator)) return
  const register = () => navigator.serviceWorker.register('/sw.js').catch(() => {})
  // the SPA often boots after `load` has already fired
  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register, { once: true })
})
