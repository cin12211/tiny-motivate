import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { schema, useDb } from '../server/db'

/**
 * Better Auth keeps signed-in sessions (with a copy of the user) in Upstash
 * (keys `motivation:auth:*`, see server/utils/cache.ts). Rewrite those copies
 * so the new role works without signing in again (same as Better Auth's own
 * refreshUserSessions).
 */
async function refreshCachedSessions(user: typeof schema.user.$inferSelect) {
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = process.env
  if (!url || !token) {
    console.log('No Upstash configured: the user must sign in again to get the new role.')
    return
  }
  const redis = async (...command: (string | number)[]) => {
    const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(command) })
    if (!res.ok) throw new Error(`Upstash ${res.status}`)
    return (await res.json() as { result: string | null }).result
  }
  const parse = (v: string | null) => (v ? JSON.parse(v) : null)
  const now = Date.now()
  const list: { token: string, expiresAt: number }[] = parse(await redis('GET', `motivation:auth:active-sessions-${user.id}`)) ?? []
  let n = 0
  for (const s of list.filter(s => s.expiresAt > now)) {
    const key = `motivation:auth:${s.token}`
    const cached = parse(await redis('GET', key))
    if (!cached?.session) continue
    const ttl = Math.floor((new Date(cached.session.expiresAt).getTime() - now) / 1000)
    if (ttl <= 0) continue
    await redis('SET', key, JSON.stringify({ session: cached.session, user }), 'EX', ttl)
    n++
  }
  console.log(`Refreshed ${n} cached session(s).`)
}

async function run() {
  const email = process.argv[2]?.trim().toLowerCase()
  if (!email) {
    console.error('Usage: pnpm db:make-admin <email>')
    process.exit(1)
  }

  const db = useDb()
  const [existing] = await db
    .select({ id: schema.user.id, name: schema.user.name, email: schema.user.email, role: schema.user.role })
    .from(schema.user)
    .where(eq(schema.user.email, email))
    .limit(1)

  if (!existing) {
    console.error(`User with email "${email}" not found in database.`)
    process.exit(1)
  }

  if (existing.role === 'admin') {
    // still refresh: sessions cached before the promotion may hold the old role
    const [user] = await db.select().from(schema.user).where(eq(schema.user.id, existing.id))
    await refreshCachedSessions(user!)
    console.log(`User "${existing.name}" (${existing.email}) is already an admin.`)
    process.exit(0)
  }

  const [user] = await db.update(schema.user).set({ role: 'admin' }).where(eq(schema.user.id, existing.id)).returning()
  await refreshCachedSessions(user!)
  console.log(`Successfully promoted "${existing.name}" (${existing.email}) to role "admin".`)
  process.exit(0)
}

run().catch((err) => {
  console.error('Failed to make admin:', err)
  process.exit(1)
})
