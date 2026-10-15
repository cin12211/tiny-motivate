import type { AuthResponse } from '#shared/types'

export default defineEventHandler(async (event): Promise<AuthResponse> => {
  const body = await readBody<{ email?: string, password?: string }>(event)
  const email = body?.email?.trim().toLowerCase() || ''
  const password = body?.password || ''

  return writeDb((db) => {
    const user = db.users.find(u => u.email === email)
    if (!user || !verifyPassword(password, user))
      throw createError({ statusCode: 401, statusMessage: 'Email hoặc mật khẩu chưa đúng' })
    const token = newToken()
    db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() })
    return { token, user: publicUser(user) }
  })
})
