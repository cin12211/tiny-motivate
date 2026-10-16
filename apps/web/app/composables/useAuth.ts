import type { User } from '#shared/types'

/**
 * Email + password auth backed by Better Auth (/api/auth/*). The session
 * token comes back in the `set-auth-token` header (bearer plugin) and is
 * kept on the device, so the same flow works on the web and in the app.
 */
export function useAuth() {
  const api = useApi()
  const { token, setToken } = useToken()
  const user = useState<User | null>('auth-user', () => null)

  async function fetchMe() {
    if (!token.value) return null
    try {
      user.value = await api<User>('/api/me')
      useSettings().apply(user.value.settings)
    }
    catch {
      user.value = null
    }
    return user.value
  }

  async function signIn(path: string, body: Record<string, string>) {
    const res = await api.raw<{ token?: string }>(path, { method: 'POST', body })
    const sessionToken = res.headers.get('set-auth-token') || res._data?.token
    if (!sessionToken) throw new Error('missing session token')
    setToken(sessionToken)
    useGoals().reset()
    await fetchMe()
  }

  const login = (email: string, password: string) =>
    signIn('/api/auth/sign-in/email', { email, password })

  const signup = (name: string, email: string, password: string) =>
    signIn('/api/auth/sign-up/email', { name, email, password })

  async function logout() {
    try {
      await api('/api/auth/sign-out', { method: 'POST', body: {} })
    }
    catch {}
    setToken(null)
    user.value = null
    useGoals().reset()
    await navigateTo('/login')
  }

  return { user, token, fetchMe, login, signup, logout }
}

/** Friendly message for Better Auth error codes (falls back to the server message). */
export function authErrorMessage(err: any) {
  const code: string | undefined = err?.data?.code
  const { t } = useNuxtApp().$i18n
  if (code === 'INVALID_EMAIL_OR_PASSWORD') return t('auth.errInvalid')
  if (code?.startsWith('USER_ALREADY_EXISTS')) return t('auth.errExists')
  if (code === 'PASSWORD_TOO_SHORT') return t('auth.errPw')
  if (code === 'INVALID_EMAIL') return t('auth.errEmail')
  return errorMessage(err)
}
