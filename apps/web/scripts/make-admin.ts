import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { schema, useDb } from '../server/db'

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
    console.log(`User "${existing.name}" (${existing.email}) is already an admin.`)
    process.exit(0)
  }

  await db.update(schema.user).set({ role: 'admin' }).where(eq(schema.user.id, existing.id))
  console.log(`Successfully promoted "${existing.name}" (${existing.email}) to role "admin".`)
  process.exit(0)
}

run().catch((err) => {
  console.error('Failed to make admin:', err)
  process.exit(1)
})
