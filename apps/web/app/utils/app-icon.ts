import { Capacitor, registerPlugin } from '@capacitor/core'
import type { UserSettings } from '#shared/types'

/** Native plugin defined in apps/mobile/ios/App/App/AppDelegate.swift. */
const AppIcon = registerPlugin<{ setIcon: (opts: { name?: string }) => Promise<void> }>('AppIcon')

/**
 * Switch the iOS home-screen icon to match the chosen logo.
 * Icons are pre-rendered per logo (normal + inverted) by
 * `pnpm --filter @motivation/mobile icons`; the default logo uses the primary icon.
 */
export async function syncAppIcon(settings: Pick<UserSettings, 'logo' | 'logoInvert'>) {
  if (import.meta.server || Capacitor.getPlatform() !== 'ios') return
  const name = settings.logo === 'forest' && !settings.logoInvert
    ? undefined
    : `AppIcon-${settings.logo}${settings.logoInvert ? '-inv' : ''}`
  try {
    await AppIcon.setIcon({ name })
  }
  catch {}
}
