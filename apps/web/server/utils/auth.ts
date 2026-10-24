import { scryptSync, timingSafeEqual } from 'node:crypto'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { hashPassword, verifyPassword } from 'better-auth/crypto'
import { bearer } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { schema, useDb } from '../db'

/**
 * Password hashes imported from the old JSON database look like
 * `legacy$<salt>$<hash>` (Node scrypt defaults). Keep accepting them so
 * existing accounts can still sign in; new passwords use Better Auth's hasher.
 */
async function verify({ hash, password }: { hash: string, password: string }) {
  if (hash.startsWith('legacy$')) {
    const [, salt, stored] = hash.split('$')
    const a = scryptSync(password, salt!, 64)
    const b = Buffer.from(stored!, 'hex')
    return a.length === b.length && timingSafeEqual(a, b)
  }
  return verifyPassword({ hash, password })
}

function createAuth() {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(useDb(), {
      provider: 'pg',
      schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification },
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      autoSignIn: true,
      password: { hash: hashPassword, verify },
    },
    // The Capacitor app has no cookies across origins: it sends the session as a bearer token.
    plugins: [bearer()],
    socialProviders: {
      ...(process.env.GOOGLE_CLIENT_ID && {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          prompt: 'select_account' as const,
        },
      }),
      ...(appleEnabled() && { apple: appleProvider() }),
    },
    // The session token is the long-lived "refresh token": 30 days, extended by
    // a day whenever it is checked. Sessions are cached in Upstash / Redis when
    // available; Postgres stays the source of truth.
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      ...(cacheEnabled() && { storeSessionInDatabase: true }),
    },
    ...(cacheEnabled() && { secondaryStorage: authSecondaryStorage() }),
    trustedOrigins: [
      'capacitor://localhost',
      'https://localhost',
      'http://localhost',
      'http://localhost:3000',
      // Apple posts the sign-in result back to us (form_post)
      'https://appleid.apple.com',
      ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) ?? []),
    ],
  })
}

let _auth: ReturnType<typeof createAuth> | undefined
/** Better Auth instance, created on first use (env/secrets are ready by then on Workers). */
export function useServerAuth() {
  return (_auth ??= createAuth())
}

export type AuthUser = ReturnType<typeof createAuth>['$Infer']['Session']['user']

/**
 * Resolve the signed-in user or throw 401. Tries the JWT / in-memory fast
 * paths first (server/utils/fast-auth.ts), then Better Auth's session check
 * (cookie or `Authorization: Bearer`).
 */
export async function requireUser(event: H3Event): Promise<FastUser> {
  return timed(event, 'auth', async () => {
    const fast = await fastUser(event)
    if (fast) {
      if (fast.banned) {
        throw createError({ statusCode: 403, statusMessage: 'Tài khoản đã bị khóa' })
      }
      return fast
    }
    const session = await useServerAuth().api.getSession({ headers: event.headers })
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Bạn cần đăng nhập' })
    const { id, name, email, createdAt } = session.user
    const rawUser = session.user as Record<string, any>
    let role = rawUser.role || 'user'
    const banned = Boolean(rawUser.banned)

    if (banned) {
      throw createError({ statusCode: 403, statusMessage: 'Tài khoản đã bị khóa' })
    }

    // Auto-promote if configured in ADMIN_EMAILS
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean)
    if (role !== 'admin' && adminEmails.includes(email.toLowerCase())) {
      role = 'admin'
      const db = useDb()
      await db.update(schema.user).set({ role: 'admin' }).where(eq(schema.user.id, id))
    }

    const user: FastUser = { id, name, email, role, banned, createdAt }
    await rememberUser(event, user)
    return user
  })
}
