import { Capacitor } from '@capacitor/core'

/**
 * Small native touches when running inside the Capacitor app:
 * light status bar over the grey paper and Android back-button navigation.
 * No-ops in a normal browser.
 */
export function useNativeShell() {
  if (import.meta.server || !Capacitor.isNativePlatform()) return
  onMounted(async () => {
    document.documentElement.classList.add('native')
    const [{ StatusBar, Style }, { App }] = await Promise.all([
      import('@capacitor/status-bar'),
      import('@capacitor/app'),
    ])
    StatusBar.setStyle({ style: Style.Light }).catch(() => {})
    const router = useRouter()
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack && router.currentRoute.value.path !== '/') router.back()
      else App.exitApp()
    })
  })
}
