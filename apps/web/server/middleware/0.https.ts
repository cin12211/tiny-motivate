import { getRequestURL } from 'h3'

/**
 * Send plain-http visits of the deployed site to https. Better Auth only trusts
 * the https origin, so logging in from http://… failed with "Invalid origin".
 * Local hosts are left alone.
 */
export default defineEventHandler((event) => {
  const url = getRequestURL(event, { xForwardedProto: true })
  if (url.protocol !== 'http:' || /^(localhost|127\.0\.0\.1|\[::1\]|192\.168\.|10\.)/.test(url.hostname)) return
  url.protocol = 'https:'
  return sendRedirect(event, url.toString(), 301)
})
