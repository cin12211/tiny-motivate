import type { UserSettings } from '#shared/types'

/** Update the signed-in user's settings (partial). Returns the full settings. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return saveSettings(user.id, await readBody<Partial<UserSettings>>(event))
})
