import type { User } from '#shared/types'

/** The signed-in user with their settings. */
export default defineEventHandler(async (event): Promise<User> => {
  const user = await requireUser(event)
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: new Date(user.createdAt).toISOString(),
    settings: await getSettings(user.id),
  }
})
