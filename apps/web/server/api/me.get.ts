import type { User } from '#shared/types'
import { eq } from 'drizzle-orm'
import { schema, useDb } from '../db'

/** The signed-in user with their settings. */
export default defineEventHandler(async (event): Promise<User> => {
  const user = await requireUser(event)
  const [dbUser] = await useDb()
    .select({
      role: schema.user.role,
      banned: schema.user.banned,
      banReason: schema.user.banReason,
      banExpires: schema.user.banExpires,
    })
    .from(schema.user)
    .where(eq(schema.user.id, user.id))
    .limit(1)

  if (dbUser?.banned) {
    const isBanActive = !dbUser.banExpires || new Date(dbUser.banExpires) > new Date()
    if (isBanActive) {
      forgetSession(event)
      setHeader(event, 'x-auth-jwt', '')
      throw createError({ statusCode: 403, statusMessage: dbUser.banReason || 'Tài khoản đã bị khóa' })
    }
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: dbUser?.role || user.role || 'user',
    banned: dbUser?.banned ?? user.banned ?? false,
    banReason: dbUser?.banReason ?? null,
    banExpires: dbUser?.banExpires ? new Date(dbUser.banExpires).toISOString() : null,
    createdAt: new Date(user.createdAt).toISOString(),
    settings: await timed(event, 'settings', () => getSettings(user.id)),
  }
})
