import type { UserSettings } from '#shared/types'
import { sanitizeSettings } from '#shared/utils/settings'

/** Update the signed-in user's settings (partial). Returns the full settings. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<Partial<UserSettings>>(event)
  return writeDb((db) => {
    const stored = db.users.find(u => u.id === user.id)!
    stored.settings = sanitizeSettings(body, sanitizeSettings(stored.settings))
    return stored.settings
  })
})
