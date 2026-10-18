/** Better Auth endpoints: /api/auth/sign-in/email, /sign-up/email, /sign-out, /get-session… */
export default defineEventHandler((event) => {
  if (event.path.includes('/sign-out')) forgetSession(event)
  return useServerAuth().handler(toWebRequest(event))
})
