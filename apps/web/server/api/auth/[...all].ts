/** Better Auth endpoints: /api/auth/sign-in/email, /sign-up/email, /sign-out, /get-session… */
export default defineEventHandler(event => useServerAuth().handler(toWebRequest(event)))
