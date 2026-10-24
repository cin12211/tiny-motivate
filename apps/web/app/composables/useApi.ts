const TOKEN_KEY = 'motivation-token'
const JWT_KEY = 'motivation-jwt'

/** Bearer token kept on the device (localStorage works in the Capacitor WebView too). */
export function useToken() {
  const token = useState<string | null>('auth-token', () => {
    if (import.meta.server) return null
    try {
      return localStorage.getItem(TOKEN_KEY)
    }
    catch {
      return null
    }
  })
  function setToken(value: string | null) {
    token.value = value
    if (!value) setJwt(null)
    try {
      if (value) localStorage.setItem(TOKEN_KEY, value)
      else localStorage.removeItem(TOKEN_KEY)
    }
    catch {}
  }
  return { token, setToken }
}

/**
 * Short-lived signed token from the server (`x-auth-jwt` header). Sent back
 * with every request so the server can skip the session lookup; refreshed
 * automatically whenever the server hands out a new one.
 */
function useJwt() {
  return useState<string | null>('auth-jwt', () => {
    if (import.meta.server) return null
    try {
      return localStorage.getItem(JWT_KEY)
    }
    catch {
      return null
    }
  })
}
function setJwt(value: string | null) {
  useJwt().value = value
  try {
    if (value) localStorage.setItem(JWT_KEY, value)
    else localStorage.removeItem(JWT_KEY)
  }
  catch {}
}

/** $fetch bound to the API base URL with the auth header. 401 → back to login. */
export function useApi() {
  const { public: { apiBase } } = useRuntimeConfig()
  const { token, setToken } = useToken()
  const jwt = useJwt()
  return $fetch.create({
    baseURL: apiBase || undefined,
    onRequest({ options }) {
      if (token.value) {
        const headers = new Headers(options.headers as HeadersInit | undefined)
        headers.set('Authorization', `Bearer ${token.value}`)
        if (jwt.value) headers.set('X-Auth-Jwt', jwt.value)
        options.headers = headers
      }
    },
    onResponse({ response }) {
      const fresh = response.headers.get('x-auth-jwt')
      if (fresh && token.value) setJwt(fresh)
    },
    async onResponseError({ response, request }) {
      if ((response.status === 401 || response.status === 403) && !String(request).includes('/api/auth/')) {
        setToken(null)
        setJwt(null)
        await navigateTo('/login')
      }
    },
  })
}

/** Uploaded photos are served by the API server; prefix them on mobile. */
export function assetUrl(path?: string | null) {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/.test(path)) return path
  return `${useRuntimeConfig().public.apiBase}${path}`
}

/** Pull the friendly message out of an H3 error. */
export function errorMessage(err: any, fallback?: string) {
  return err?.data?.statusMessage || err?.data?.message || err?.statusMessage || fallback || useNuxtApp().$i18n.t('common.errorGeneric')
}
