import { VIEWBOX, iconById } from '@motivation/garden'
import type { UserSettings } from '#shared/types'
import { ACCENTS } from '#shared/utils/settings'

type FaviconSettings = Pick<UserSettings, 'accent' | 'logo' | 'theme'>
let latest: FaviconSettings | null = null
let watching = false

/**
 * Browser tab icon = the user's app logo, drawn like the iOS icon:
 * light = white tile + accent icon, dark = #1F1E27 tile + the accent's dark colour.
 * "theo máy" follows the device appearance.
 */
export function syncFavicon(settings: FaviconSettings) {
  if (import.meta.server) return
  latest = settings
  const media = matchMedia('(prefers-color-scheme: dark)')
  if (!watching) {
    watching = true
    media.addEventListener('change', () => latest && syncFavicon(latest))
  }
  const dark = settings.theme === 'dark' || (settings.theme === 'system' && media.matches)
  const accent = ACCENTS[settings.accent] ?? ACCENTS[0]!
  const body = iconById(settings.logo)?.body ?? iconById('p2')!.body
  const [, , w] = VIEWBOX.split(' ').map(Number) // 0 0 32 32
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${w}">`
    + `<rect width="${w}" height="${w}" rx="${w * 0.26}" fill="${dark ? '#1F1E27' : '#FFFFFF'}"/>`
    + `<g transform="translate(${w * 0.14} ${w * 0.14}) scale(.72)" style="color:${dark ? accent.dark : accent.light}">${body}</g></svg>`

  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.type = 'image/svg+xml'
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`
}
