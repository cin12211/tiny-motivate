import { eq } from 'drizzle-orm'
import type { UserSettings } from '#shared/types'
import { DEFAULT_SETTINGS, sanitizeSettings } from '#shared/utils/settings'
import { schema, useDb } from '../db'

const { userSettings } = schema

const SETTINGS_TTL = 300
const settingsKey = (userId: string) => `settings:${userId}`

/** A user's settings, cached for a few minutes (invalidated when they change). */
export function getSettings(userId: string): Promise<UserSettings> {
  return cached(settingsKey(userId), SETTINGS_TTL, () => loadSettings(userId))
}

async function loadSettings(userId: string): Promise<UserSettings> {
  const [row] = await useDb().select().from(userSettings).where(eq(userSettings.userId, userId))
  if (!row) return { ...DEFAULT_SETTINGS }
  const { accent, logo, theme, notify, time, lang } = row
  return sanitizeSettings({ accent, logo, theme, notify, time, lang })
}

/** Merge a partial update into the user's settings and return the result. */
export async function saveSettings(userId: string, patch: Partial<UserSettings>): Promise<UserSettings> {
  const next = sanitizeSettings(patch, await loadSettings(userId))
  await useDb().insert(userSettings)
    .values({ userId, ...next, updatedAt: new Date() })
    .onConflictDoUpdate({ target: userSettings.userId, set: { ...next, updatedAt: new Date() } })
  await invalidate(settingsKey(userId))
  return next
}
