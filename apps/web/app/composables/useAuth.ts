import { Capacitor } from '@capacitor/core'
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

  /**
   * Google sign-in runs in a real browser (Google blocks embedded WebViews):
   * the page itself on the web, the in-app Safari sheet on iOS. The server
   * hands the session token back via /auth/callback or motivation://auth.
   */
  async function loginWithGoogle() {
    const native = Capacitor.isNativePlatform()
    const base = useRuntimeConfig().public.apiBase || window.location.origin
    const url = `${base}/api/oauth/start?to=${native ? 'app' : 'web'}`
    if (!native) {
      window.location.href = url
      return
    }
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url, presentationStyle: 'popover' })
  }

  /**
   * Sign in with Apple. iOS app: the native Apple sheet (Face ID), then the
   * identity token goes to Better Auth. Web (and Android): Apple's sign-in
   * page in the browser, same round trip as Google.
   */
  async function loginWithApple() {
    if (Capacitor.getPlatform() === 'ios') {
      const { SignInWithApple } = await import('@capacitor-community/apple-sign-in')
      const nonce = crypto.randomUUID()
      const { response } = await SignInWithApple.authorize({
        clientId: 'app.motivation.tinymotivate',
        redirectURI: `${useRuntimeConfig().public.apiBase}/api/auth/callback/apple`,
        scopes: 'email name',
        nonce,
      })
      const name = { firstName: response.givenName ?? undefined, lastName: response.familyName ?? undefined }
      const res = await api.raw<{ token?: string }>('/api/auth/sign-in/social', {
        method: 'POST',
        body: { provider: 'apple', idToken: { token: response.identityToken, nonce, user: { name, ...(response.email && { email: response.email }) } } },
      })
      const sessionToken = res.headers.get('set-auth-token') || res._data?.token
      if (!sessionToken) throw new Error('missing session token')
      setToken(sessionToken)
      useGoals().reset()
      await fetchMe()
      return
    }
    const native = Capacitor.isNativePlatform()
    const base = useRuntimeConfig().public.apiBase || window.location.origin
    const url = `${base}/api/oauth/start?provider=apple&to=${native ? 'app' : 'web'}`
    if (!native) {
      window.location.href = url
      return
    }
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url, presentationStyle: 'popover' })
  }

  /** Finish a Google / Apple sign-in with the token from the callback. */
  async function acceptToken(sessionToken: string) {
    setToken(sessionToken)
    useGoals().reset()
    return fetchMe()
  }

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

  return { user, token, fetchMe, login, signup, loginWithGoogle, loginWithApple, acceptToken, logout }
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
