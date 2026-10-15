import type { AuthResponse, User } from '#shared/types'

export function useAuth() {
  const api = useApi()
  const { token, setToken } = useToken()
  const user = useState<User | null>('auth-user', () => null)

  async function fetchMe() {
    if (!token.value) return null
    try {
      user.value = await api<User>('/api/auth/me')
      useSettings().apply(user.value.settings)
    }
    catch {
      user.value = null
    }
    return user.value
  }

  function accept(res: AuthResponse) {
    setToken(res.token)
    user.value = res.user
    useSettings().apply(res.user.settings)
    useGoals().reset()
  }

  async function login(email: string, password: string) {
    accept(await api<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password } }))
  }

  async function signup(name: string, email: string, password: string) {
    accept(await api<AuthResponse>('/api/auth/signup', { method: 'POST', body: { name, email, password } }))
  }

  async function logout() {
    try {
      await api('/api/auth/logout', { method: 'POST' })
    }
    catch {}
    setToken(null)
    user.value = null
    useGoals().reset()
    await navigateTo('/login')
  }

  return { user, token, fetchMe, login, signup, logout }
}
