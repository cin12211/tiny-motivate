import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import type { StoredUser, User } from '#shared/types'

/**
 * Minimal token auth for the JSON-file backend.
 * Passwords are hashed with scrypt; sessions are opaque bearer tokens
 * (the Capacitor app can't rely on cookies across origins).
 */

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  return { hash: scryptSync(password, salt, 64).toString('hex'), salt }
}

export function verifyPassword(password: string, user: Pick<StoredUser, 'passwordHash' | 'salt'>) {
  const a = Buffer.from(hashPassword(password, user.salt).hash, 'hex')
  const b = Buffer.from(user.passwordHash, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

export function newToken() {
  return randomBytes(32).toString('base64url')
}

export function publicUser({ id, name, email, createdAt }: StoredUser): User {
  return { id, name, email, createdAt }
}

export function bearerToken(event: H3Event) {
  const header = getHeader(event, 'authorization') || ''
  return header.startsWith('Bearer ') ? header.slice(7).trim() : ''
}

/** Resolve the signed-in user or throw 401. */
export async function requireUser(event: H3Event): Promise<User> {
  const token = bearerToken(event)
  if (token) {
    const db = await readDb()
    const session = db.sessions.find(s => s.token === token)
    const user = session && db.users.find(u => u.id === session.userId)
    if (user) return publicUser(user)
  }
  throw createError({ statusCode: 401, statusMessage: 'Bạn cần đăng nhập' })
}

export const EMAIL_RE = /^\S+@\S+\.\S+$/
