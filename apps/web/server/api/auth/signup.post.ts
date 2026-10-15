import { nanoid } from 'nanoid'
import type { AuthResponse } from '#shared/types'

export default defineEventHandler(async (event): Promise<AuthResponse> => {
  const body = await readBody<{ name?: string, email?: string, password?: string }>(event)
  const name = body?.name?.trim() || ''
  const email = body?.email?.trim().toLowerCase() || ''
  const password = body?.password || ''

  if (!name) throw createError({ statusCode: 400, statusMessage: 'Cho Mochi biết tên bạn nhé' })
  if (!EMAIL_RE.test(email)) throw createError({ statusCode: 400, statusMessage: 'Email chưa đúng định dạng' })
  if (password.length < 8) throw createError({ statusCode: 400, statusMessage: 'Mật khẩu cần ít nhất 8 ký tự' })

  const result = await writeDb((db) => {
    if (db.users.some(u => u.email === email))
      throw createError({ statusCode: 409, statusMessage: 'Email này đã có tài khoản' })
    const { hash, salt } = hashPassword(password)
    const user = { id: nanoid(10), name, email, passwordHash: hash, salt, createdAt: new Date().toISOString() }
    const token = newToken()
    db.users.push(user)
    db.sessions.push({ token, userId: user.id, createdAt: user.createdAt })
    return { token, user: publicUser(user) }
  })
  setResponseStatus(event, 201)
  return result
})
