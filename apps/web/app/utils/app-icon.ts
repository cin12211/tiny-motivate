import { Capacitor, registerPlugin } from '@capacitor/core'
import type { UserSettings } from '#shared/types'
import { ACCENTS, DEFAULT_SETTINGS } from '#shared/utils/settings'

/** Native plugin defined in apps/mobile/ios/App/App/AppDelegate.swift. */
const AppIcon = registerPlugin<{ setIcon: (opts: { name?: string }) => Promise<void> }>('AppIcon')

/**
 * Switch the iOS home-screen icon to match the chosen accent colour and logo.
 * Icons are pre-rendered per accent × logo (white tile, accent icon) by
 * `pnpm --filter @motivation/mobile icons`; the default accent + logo (DEFAULT_SETTINGS) use the primary icon.
 */
export async function syncAppIcon(settings: Pick<UserSettings, 'accent' | 'logo'>) {
  if (import.meta.server || Capacitor.getPlatform() !== 'ios') return
  const d = DEFAULT_SETTINGS
  const isDefault = settings.accent === d.accent && settings.logo === d.logo
  const accent = (ACCENTS[settings.accent] ?? ACCENTS[0]!).key
  const name = isDefault ? undefined : `AppIcon-${accent}-${settings.logo}`
  try {
    await AppIcon.setIcon({ name })
  }
  catch {}
}
