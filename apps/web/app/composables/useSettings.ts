import type { UserSettings } from '#shared/types'
import { ACCENTS, DEFAULT_SETTINGS, sanitizeSettings } from '#shared/utils/settings'

const CACHE_KEY = 'motivation-settings'

/**
 * The signed-in user's settings (accent colour, logo, daily reminder).
 * Saved on the server per user; also cached on the device so the splash
 * screen can show the right logo and colour before login finishes.
 */
export function useSettings() {
  const settings = useState<UserSettings>('settings', () => readCache())

  function apply(value: UserSettings, askPermission = false) {
    settings.value = value
    writeCache(value)
    applyAccent(value.accent)
    applyTheme(value.theme)
    scheduleReminder(value, askPermission)
    syncAppIcon(value)
  }

  async function update(patch: Partial<UserSettings>) {
    const next = sanitizeSettings(patch, settings.value)
    const reminderChanged = 'notify' in patch || 'time' in patch
    apply(next, reminderChanged) // optimistic; the server echoes the stored value
    apply(await useApi()<UserSettings>('/api/settings', { method: 'PUT', body: patch }))
  }

  return { settings, apply, update }
}

function readCache(): UserSettings {
  if (import.meta.server) return DEFAULT_SETTINGS
  try {
    return sanitizeSettings(JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'))
  }
  catch {
    return DEFAULT_SETTINGS
  }
}

function writeCache(value: UserSettings) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value))
  }
  catch {}
}

/**
 * Light / dark / follow the device. Sets `.light` / `.dark` on <html>
 * (the CSS tokens key off those) plus data-theme for parity with the design.
 */
export function applyTheme(theme: UserSettings['theme']) {
  if (import.meta.server) return
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.classList.toggle('light', theme === 'light')
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme === 'system' ? 'light dark' : theme
  syncStatusBar(theme)
}

let statusBarTheme: UserSettings['theme'] = 'system'
let watchingScheme = false

/** Native status bar text: dark on the light theme, light on the dark theme. */
async function syncStatusBar(theme: UserSettings['theme']) {
  const { Capacitor } = await import('@capacitor/core')
  if (!Capacitor.isNativePlatform()) return
  statusBarTheme = theme
  const media = matchMedia('(prefers-color-scheme: dark)')
  if (!watchingScheme) {
    watchingScheme = true
    media.addEventListener('change', () => syncStatusBar(statusBarTheme))
  }
  const dark = theme === 'dark' || (theme === 'system' && media.matches)
  const { StatusBar, Style } = await import('@capacitor/status-bar')
  StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {})
}

/** Swap the app-wide accent (light + dark values) by overriding --m-indigo. */
export function applyAccent(index: number) {
  if (import.meta.server) return
  const { light, dark } = ACCENTS[index] ?? ACCENTS[0]!
  let el = document.getElementById('accent-style') as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = 'accent-style'
    document.head.appendChild(el)
  }
  el.textContent = `:root{--m-indigo:${light}}`
    + `@media (prefers-color-scheme: dark){:root:not(.light){--m-indigo:${dark}}}`
    + `.dark{--m-indigo:${dark}}`
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--m-paper').trim() || '#E6E5EA')
}
