const PUBLIC = new Set(['/login', '/signup'])

/** Send signed-out visitors to /login and signed-in ones away from it. */
export default defineNuxtRouteMiddleware(async (to) => {
  const { token, user, fetchMe } = useAuth()
  if (token.value && !user.value) await fetchMe()
  const signedIn = !!user.value

  if (!signedIn && !PUBLIC.has(to.path)) return navigateTo('/login')
  if (signedIn && PUBLIC.has(to.path)) return navigateTo('/')
})
