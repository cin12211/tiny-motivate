export default defineNuxtRouteMiddleware(async () => {
  const { user, fetchMe } = useAuth()
  const { token } = useToken()

  if (!token.value) {
    return navigateTo('/login')
  }

  let currentUser = user.value
  if (!currentUser) {
    currentUser = await fetchMe()
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return navigateTo('/')
  }
})
