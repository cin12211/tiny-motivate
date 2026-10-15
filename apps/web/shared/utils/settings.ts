import type { UserSettings } from '../types'

/** Accent colours offered in Settings: [name, light value, dark value]. */
export const ACCENTS: ReadonlyArray<readonly [name: string, light: string, dark: string]> = [
  ['mực xanh', '#1A0DC9', '#968EFF'],
  ['rêu', '#2F6B3A', '#8CCB95'],
  ['đất nung', '#B4532A', '#F0A27E'],
  ['hồng', '#C2387A', '#F39BC4'],
  ['tím', '#6B2FD1', '#B79BFF'],
  ['biển', '#0B6E99', '#7CC8EA'],
  ['than', '#2B2B33', '#D4D3DC'],
  ['mù tạt', '#8A6A00', '#E3C155'],
]

/** Garden icons the user can pick as the app logo. */
export const LOGOS = ['forest', 'p1', 'p2', 'p4', 'p5', 'p7', 'p10', 'p12', 'p13', 'p21', 'p23', 'p28', 'm2', 'm5'] as const

export const DEFAULT_SETTINGS: UserSettings = { accent: 0, logo: 'forest', notify: true, time: '20:00' }

/** Merge untrusted input over current settings, keeping only valid values. */
export function sanitizeSettings(input: Partial<UserSettings> | undefined, base: UserSettings = DEFAULT_SETTINGS): UserSettings {
  const out = { ...DEFAULT_SETTINGS, ...base }
  if (!input) return out
  if (Number.isInteger(input.accent) && input.accent! >= 0 && input.accent! < ACCENTS.length) out.accent = input.accent!
  if (typeof input.logo === 'string' && (LOGOS as readonly string[]).includes(input.logo)) out.logo = input.logo
  if (typeof input.notify === 'boolean') out.notify = input.notify
  if (typeof input.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) out.time = input.time
  return out
}
