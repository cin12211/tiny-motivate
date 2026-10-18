const PUBLIC = new Set(['/login', '/signup', '/auth/callback'])
/** Open to everyone, signed in or not (no redirect either way). */
const OPEN = new Set(['/landing-page'])

/** Send signed-out visitors to /login and signed-in ones away from it. */
export default defineNuxtRouteMiddleware(async (to) => {
  if (OPEN.has(to.path)) return
  const { token, user, fetchMe } = useAuth()
  // first load: ask for the user and the goals at the same time
  if (token.value && !user.value) await Promise.all([fetchMe(), useGoals().ensureLoaded().catch(() => {})])
  const signedIn = !!user.value

  if (!signedIn && !PUBLIC.has(to.path)) return navigateTo('/login')
  if (signedIn && PUBLIC.has(to.path)) return navigateTo('/')
})
