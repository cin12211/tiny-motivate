import { PLANTS, MOODS } from '@motivation/garden'
import type { UserSettings } from '../types'

export interface Accent {
  /** i18n key under `accents.` */
  key: string
  light: string
  dark: string
}

/**
 * Accent colours offered in Settings, each with a light- and dark-mode value.
 * Append only: users store the index.
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
  { key: 'cherry', light: '#B3243B', dark: '#FF8A9B' },
  { key: 'coral', light: '#D2553F', dark: '#FF9F8A' },
  { key: 'pumpkin', light: '#C75F00', dark: '#FFAE5C' },
  { key: 'honey', light: '#A67C00', dark: '#F2CC5B' },
  { key: 'olive', light: '#5E6B1F', dark: '#C4D17A' },
  { key: 'leaf', light: '#3D8B1E', dark: '#9EDB7A' },
  { key: 'jade', light: '#0E7A5A', dark: '#6FD9B4' },
  { key: 'teal', light: '#0F7480', dark: '#6DD3DE' },
  { key: 'sky', light: '#1C7FD6', dark: '#86C2F7' },
  { key: 'cobalt', light: '#2341B8', dark: '#97A9FF' },
  { key: 'lavender', light: '#7A55C7', dark: '#C7B3F5' },
  { key: 'plum', light: '#7B2A6B', dark: '#E39AD3' },
  { key: 'rose', light: '#B23A5C', dark: '#F5A3BA' },
  { key: 'cocoa', light: '#6B4332', dark: '#D9AE97' },
  { key: 'slate', light: '#46566B', dark: '#B4C2D4' },
  { key: 'forest', light: '#1F4D35', dark: '#86C9A5' },
]

/** Every garden icon can be the app logo: the forest, all 55 plants and the 5 mood flowers. */
export const LOGOS: readonly string[] = ['forest', ...PLANTS.map(p => `p${p.id}`), ...MOODS.map(m => m.id)]

export const LANGS = ['vi', 'en'] as const

export const DEFAULT_SETTINGS: UserSettings = { accent: 0, logo: 'p2', logoInvert: false, notify: true, time: '20:00', lang: 'vi' }

/** Merge untrusted input over current settings, keeping only valid values. */
export function sanitizeSettings(input: Partial<UserSettings> | undefined, base: UserSettings = DEFAULT_SETTINGS): UserSettings {
  const out = { ...DEFAULT_SETTINGS, ...base }
  if (!input) return out
  if (Number.isInteger(input.accent) && input.accent! >= 0 && input.accent! < ACCENTS.length) out.accent = input.accent!
  if (typeof input.logo === 'string' && LOGOS.includes(input.logo)) out.logo = input.logo
  if (typeof input.logoInvert === 'boolean') out.logoInvert = input.logoInvert
  if (typeof input.notify === 'boolean') out.notify = input.notify
  if (typeof input.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) out.time = input.time
  if (typeof input.lang === 'string' && (LANGS as readonly string[]).includes(input.lang)) out.lang = input.lang
  return out
}
