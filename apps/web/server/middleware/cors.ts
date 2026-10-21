/**
 * The Capacitor app is served from capacitor://localhost (iOS) or
 * https://localhost (Android), so the API must accept cross-origin calls.
 * Auth uses a bearer token, not cookies, so a wildcard origin is safe here.
 */
export default defineEventHandler((event) => {
  const path = event.path || ''
  if (!path.startsWith('/api/') && !path.startsWith('/uploads/')) return
  const handled = handleCors(event, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type', 'X-Auth-Jwt'],
    // Better Auth returns the session token for the app in this header
    exposeHeaders: ['set-auth-token', 'x-auth-jwt', 'server-timing'],
    maxAge: '86400',
  })
  if (handled) return ''
})
