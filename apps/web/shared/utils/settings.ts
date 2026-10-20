import { LOGO_IDS } from '@motivation/garden'
import type { UserSettings } from '../types'

export interface Accent {
  /** i18n key under `accents.` */
  key: string
  light: string
  dark: string
}

/**
 * Accent colours offered in Settings, each with a light- and dark-mode value.
 * Append only: users store the index (out-of-range values fall back to the default).
 */
export const ACCENTS: ReadonlyArray<Accent> = [
  { key: 'ink', light: '#1A0DC9', dark: '#968EFF' },
  { key: 'moss', light: '#2F6B3A', dark: '#8CCB95' },
  { key: 'terracotta', light: '#B4532A', dark: '#F0A27E' },
  { key: 'pink', light: '#C2387A', dark: '#F39BC4' },
  { key: 'violet', light: '#6B2FD1', dark: '#B79BFF' },
  { key: 'sea', light: '#0B6E99', dark: '#7CC8EA' },
  { key: 'charcoal', light: '#2B2B33', dark: '#D4D3DC' },
  { key: 'mustard', light: '#8A6A00', dark: '#E3C155' },
]

/**
 * The 20 app logos offered in Settings (packages/garden/src/logos.ts). A logo
 * saved earlier that is no longer offered falls back to the default.
 */
export const LOGOS: readonly string[] = LOGO_IDS

export const LANGS = ['vi', 'en'] as const
export const THEMES = ['system', 'light', 'dark'] as const

export const DEFAULT_SETTINGS: UserSettings = { accent: 0, logo: 'p2', theme: 'system', notify: true, time: '20:00', lang: 'vi' }

/** Merge untrusted input over current settings, keeping only valid values. */
export function sanitizeSettings(input: Partial<UserSettings> | undefined, base: UserSettings = DEFAULT_SETTINGS): UserSettings {
  const out = { ...DEFAULT_SETTINGS, ...base }
  if (!input) return out
  if (Number.isInteger(input.accent) && input.accent! >= 0 && input.accent! < ACCENTS.length) out.accent = input.accent!
  if (typeof input.logo === 'string' && LOGOS.includes(input.logo)) out.logo = input.logo
  if (typeof input.theme === 'string' && (THEMES as readonly string[]).includes(input.theme)) out.theme = input.theme
  if (typeof input.notify === 'boolean') out.notify = input.notify
  if (typeof input.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) out.time = input.time
  if (typeof input.lang === 'string' && (LANGS as readonly string[]).includes(input.lang)) out.lang = input.lang
  return out
}
