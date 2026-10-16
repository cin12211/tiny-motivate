/**
 * Google sign-in landed here with a session cookie. Hand the session token
 * to the client: back to the SPA (/auth/callback) or the iOS app through
 * the motivation:// URL scheme.
 */
export default defineEventHandler(async (event) => {
  const { to, error } = getQuery(event)
  const session = error ? null : await useServerAuth().api.getSession({ headers: event.headers })
  const params = new URLSearchParams(session ? { token: session.session.token } : { error: 'oauth' })
  if (to === 'app') return sendRedirect(event, `motivation://auth?${params}`)
  return sendRedirect(event, `/auth/callback?${params}`)
})
