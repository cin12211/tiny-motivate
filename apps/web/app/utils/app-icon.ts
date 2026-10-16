import { Capacitor, registerPlugin } from '@capacitor/core'
import type { UserSettings } from '#shared/types'
import { ACCENTS, DEFAULT_SETTINGS } from '#shared/utils/settings'

/** Native plugin defined in apps/mobile/ios/App/App/AppDelegate.swift. */
const AppIcon = registerPlugin<{ setIcon: (opts: { name?: string }) => Promise<void> }>('AppIcon')

type IconSettings = Pick<UserSettings, 'accent' | 'logo' | 'theme'>
let latest: IconSettings | null = null
let watching = false

/**
 * Switch the iOS home-screen icon to match the chosen accent colour, logo and
 * light/dark look ("theo máy" follows the phone's appearance).
 * Icons are pre-rendered per accent × logo × light/dark by
 * `pnpm --filter @motivation/mobile icons`; the default accent + logo in light (DEFAULT_SETTINGS) use the primary icon.
 */
export async function syncAppIcon(settings: IconSettings) {
  if (import.meta.server || Capacitor.getPlatform() !== 'ios') return
  latest = settings
  const media = matchMedia('(prefers-color-scheme: dark)')
  if (!watching) {
    watching = true
    media.addEventListener('change', () => latest && syncAppIcon(latest))
  }
  const dark = settings.theme === 'dark' || (settings.theme === 'system' && media.matches)
  const d = DEFAULT_SETTINGS
  const isDefault = !dark && settings.accent === d.accent && settings.logo === d.logo
  const accent = (ACCENTS[settings.accent] ?? ACCENTS[0]!).key
  const name = isDefault ? undefined : `AppIcon-${accent}-${settings.logo}${dark ? '-dark' : ''}`
  try {
    await AppIcon.setIcon({ name })
  }
  catch {}
}
