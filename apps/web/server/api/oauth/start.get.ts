/**
 * Start Google sign-in in a real browser tab (web page or the iOS in-app
 * Safari sheet): asks Better Auth for the provider URL, forwards its state
 * cookie, then redirects to Google. `?to=app` returns to the native app.
 */
export default defineEventHandler(async (event) => {
  const to = getQuery(event).to === 'app' ? 'app' : 'web'
  const origin = getRequestURL(event).origin
  const res = await useServerAuth().api.signInSocial({
    body: {
      provider: 'google',
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
