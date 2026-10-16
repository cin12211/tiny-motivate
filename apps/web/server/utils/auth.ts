import { scryptSync, timingSafeEqual } from 'node:crypto'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { hashPassword, verifyPassword } from 'better-auth/crypto'
import { bearer } from 'better-auth/plugins'
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
    socialProviders: process.env.GOOGLE_CLIENT_ID
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            prompt: 'select_account',
          },
        }
      : undefined,
    // Sessions are cached in Redis when available; Postgres stays the source of truth.
    ...(cacheEnabled() && {
      secondaryStorage: authSecondaryStorage(),
      session: { storeSessionInDatabase: true },
    }),
    trustedOrigins: [
      'capacitor://localhost',
      'https://localhost',
      'http://localhost',
      'http://localhost:3000',
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

/** Resolve the signed-in user (cookie or `Authorization: Bearer`) or throw 401. */
export async function requireUser(event: H3Event): Promise<AuthUser> {
  const session = await useServerAuth().api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Bạn cần đăng nhập' })
  return session.user
}
