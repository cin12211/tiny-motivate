import type { H3Event } from 'h3'

/**
 * Fast paths in front of Better Auth's session lookup:
 *
 * 1. JWT (HS256, lives 30 days). After a normal session check the server hands
 *    the app a signed token in the `x-auth-jwt` response header; the app sends
 *    it back in the same header and the server only verifies the signature -
 *    no cache or database call. Once a JWT is more than a day old the server
 *    checks the session (the 30-day "refresh token") once more and issues a
 *    fresh JWT, which also extends the session. So signing out / revoking a
 *    session takes effect within about a day.
 * 2. L1 in-memory cache (per Worker isolate, 60 s) keyed by session token, for
 *    requests without a valid JWT.
 * Otherwise Better Auth checks the session (Upstash, then Neon).
 */
export interface FastUser {
  id: string
  name: string
  email: string
  role: string
  banned?: boolean
  createdAt: string | Date
}

const JWT_TTL = 30 * 24 * 60 * 60 // seconds (30 days)
const JWT_RECHECK = 24 * 60 * 60 // seconds: re-check the session once a day
const L1_TTL = 60_000 // ms
const L1_MAX = 500
const l1 = new Map<string, { user: FastUser, until: number }>()

const enc = new TextEncoder()
const b64url = (bytes: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const fromB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))

let keyPromise: Promise<CryptoKey> | undefined
function hmacKey() {
  keyPromise ??= crypto.subtle.importKey('raw', enc.encode(`jwt:${process.env.BETTER_AUTH_SECRET}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
  return keyPromise
}

export async function signJwt(user: FastUser) {
  const header = b64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const now = Math.floor(Date.now() / 1000)
  const payload = b64url(enc.encode(JSON.stringify({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    banned: user.banned ?? false,
    createdAt: new Date(user.createdAt).toISOString(),
    iat: now,
    exp: now + JWT_TTL,
  })))
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(), enc.encode(`${header}.${payload}`))
  return `${header}.${payload}.${b64url(sig)}`
}

export async function verifyJwt(token: string): Promise<(FastUser & { iat?: number }) | null> {
  const [header, payload, sig] = token.split('.')
  if (!header || !payload || !sig) return null
  try {
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(), fromB64url(sig), enc.encode(`${header}.${payload}`))
    if (!ok) return null
    const claims = JSON.parse(new TextDecoder().decode(fromB64url(payload)))
    if (typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now()) return null
    return {
      id: claims.sub,
      name: claims.name,
      email: claims.email,
      role: claims.role || 'user',
      banned: claims.banned ?? false,
      createdAt: claims.createdAt,
      iat: claims.iat,
    }
  }
  catch {
    return null
  }
}

/** Session token from `Authorization: Bearer <token>` (signed form: token.signature). */
function sessionToken(event: H3Event) {
  const auth = getHeader(event, 'authorization') || ''
  return auth.startsWith('Bearer ') ? auth.slice(7) : ''
}

/** User from the JWT header or the L1 cache, or null to fall back to Better Auth. */
export async function fastUser(event: H3Event): Promise<FastUser | null> {
  const jwt = getHeader(event, 'x-auth-jwt')
  if (jwt) {
    const claims = await verifyJwt(jwt)
    // older than a day: fall through to a real session check (renews the JWT + session)
    if (claims && (claims.iat ?? 0) > Date.now() / 1000 - JWT_RECHECK) {
      const { iat: _iat, ...user } = claims
      return user
    }
  }
  const token = sessionToken(event)
  const hit = token ? l1.get(token) : undefined
  if (hit && hit.until > Date.now()) {
    await issueJwt(event, hit.user)
    return hit.user
  }
  return null
}

/** Remember a checked session (L1) and give the client a fresh JWT. */
export async function rememberUser(event: H3Event, user: FastUser) {
  const token = sessionToken(event)
  if (token) {
    if (l1.size >= L1_MAX) l1.delete(l1.keys().next().value!)
    l1.set(token, { user, until: Date.now() + L1_TTL })
  }
  await issueJwt(event, user)
}

/** Forget a session in this isolate (sign-out). */
export function forgetSession(event: H3Event) {
  const token = sessionToken(event)
  if (token) l1.delete(token)
}

async function issueJwt(event: H3Event, user: FastUser) {
  setHeader(event, 'x-auth-jwt', await signJwt(user))
}
