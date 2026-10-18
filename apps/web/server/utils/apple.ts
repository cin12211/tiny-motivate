import { SignJWT, importPKCS8 } from 'jose'

/**
 * Sign in with Apple settings (Better Auth `apple` provider).
 *   APPLE_TEAM_ID       Apple Developer team ID
 *   APPLE_SERVICES_ID   Services ID used by the web flow (the OAuth client ID)
 *   APPLE_KEY_ID        ID of the "Sign in with Apple" key
 *   APPLE_PRIVATE_KEY   contents of that key's .p8 file
 *   APPLE_BUNDLE_ID     iOS bundle ID (native sign-in tokens are issued for it)
 */
export const appleEnabled = () =>
  !!(process.env.APPLE_TEAM_ID && process.env.APPLE_SERVICES_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY)

/**
 * Apple wants the client secret as a JWT signed with the .p8 key (ES256),
 * valid for at most 6 months. It is made when a Worker starts, so it never
 * gets close to expiring.
 */
async function appleClientSecret() {
  const { APPLE_TEAM_ID, APPLE_SERVICES_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY } = process.env
  const pem = APPLE_PRIVATE_KEY!.replace(/\\n/g, '\n').trim()
  const key = await importPKCS8(pem, 'ES256')
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: APPLE_KEY_ID! })
    .setIssuer(APPLE_TEAM_ID!)
    .setSubject(APPLE_SERVICES_ID!)
    .setAudience('https://appleid.apple.com')
    .setIssuedAt()
    .setExpirationTime('150d')
    .sign(key)
}

/** Provider config for Better Auth (an async function so the secret can be signed first). */
export function appleProvider() {
  const { APPLE_SERVICES_ID, APPLE_BUNDLE_ID } = process.env
  return async () => ({
    clientId: APPLE_SERVICES_ID!,
    clientSecret: await appleClientSecret(),
    // web tokens are issued for the Services ID, native iOS ones for the bundle ID
    audience: [APPLE_SERVICES_ID!, ...(APPLE_BUNDLE_ID ? [APPLE_BUNDLE_ID] : [])],
    ...(APPLE_BUNDLE_ID && { appBundleIdentifier: APPLE_BUNDLE_ID }),
  })
}
