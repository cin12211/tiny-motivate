import { Capacitor } from '@capacitor/core'

/**
 * Small native touches when running inside the Capacitor app:
 * light status bar, Android back button, and the motivation:// deep link
 * that finishes Google sign-in. No-ops in a normal browser.
 */
export function useNativeShell() {
  if (import.meta.server || !Capacitor.isNativePlatform()) return
  // grab Nuxt-bound helpers while we still have the component context
  const router = useRouter()
  const auth = useAuth()

  onMounted(async () => {
    document.documentElement.classList.add('native')
    const { App } = await import('@capacitor/app')
    // status bar style follows the theme: see syncStatusBar in useSettings.ts

    // Google sign-in comes back as motivation://auth?token=… (see /api/oauth/done)
    App.addListener('appUrlOpen', async ({ url }) => {
      if (!url.startsWith('motivation://auth')) return
      const params = new URL(url.replace('motivation://', 'https://app/')).searchParams
      const { Browser } = await import('@capacitor/browser')
      Browser.close().catch(() => {})
      const token = params.get('token')
      auth.busy.value = 'google'
      const user = token ? await auth.acceptToken(token) : null
      await router.replace(user ? '/' : '/login')
      auth.busy.value = null
    })

    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack && router.currentRoute.value.path !== '/') router.back()
      else App.exitApp()
    })
  })
}
