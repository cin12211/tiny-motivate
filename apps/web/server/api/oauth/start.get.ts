/**
 * Start Google / Apple sign-in in a real browser tab (web page or the iOS
 * in-app Safari sheet): asks Better Auth for the provider URL, forwards its
 * state cookie, then redirects there. `?provider=apple` picks Apple (Google by
 * default); `?to=app` returns to the native app.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const to = query.to === 'app' ? 'app' : 'web'
  const provider = query.provider === 'apple' ? 'apple' : 'google'
  const origin = getRequestURL(event).origin
  if (provider === 'apple' && !appleEnabled()) return sendRedirect(event, `${origin}/api/oauth/done?to=${to}&error=1`)
  const res = await useServerAuth().api.signInSocial({
    body: {
      provider,
      callbackURL: `${origin}/api/oauth/done?to=${to}`,
      errorCallbackURL: `${origin}/api/oauth/done?to=${to}&error=1`,
      disableRedirect: true,
    },
    headers: event.headers,
    returnHeaders: true,
  })
  for (const cookie of res.headers.getSetCookie()) appendResponseHeader(event, 'set-cookie', cookie)
  return sendRedirect(event, res.response.url!)
})
