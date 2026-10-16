/**
 * One-off import of the old JSON database (data/db.json) into Postgres.
 * Safe to re-run: existing rows are left untouched.
 *
 *   pnpm --filter @motivation/web db:import-json
 *
 * Passwords are kept as `legacy$<salt>$<hash>`; server/utils/auth.ts still
 * verifies that format, so old accounts sign in with the same password.
 */
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema.ts'

const file = process.argv[2] || 'data/db.json'
const json = JSON.parse(readFileSync(file, 'utf8'))
const db = drizzle(neon(process.env.DATABASE_URL!), { schema })
const S = schema

let counts = { users: 0, goals: 0, rewards: 0, days: 0 }
for (const u of json.users ?? []) {
  const createdAt = new Date(u.createdAt ?? Date.now())
  await db.insert(S.user).values({ id: u.id, name: u.name, email: u.email.toLowerCase(), createdAt, updatedAt: createdAt }).onConflictDoNothing()
  await db.insert(S.account).values({
    id: randomUUID(), accountId: u.id, providerId: 'credential', userId: u.id,
    password: `legacy$${u.salt}$${u.passwordHash}`, createdAt, updatedAt: createdAt,
  }).onConflictDoNothing()
  if (u.settings) {
    const { accent = 0, logo = 'p2', theme = 'system', notify = true, time = '20:00', lang = 'vi' } = u.settings
    await db.insert(S.userSettings).values({ userId: u.id, accent: accent < 6 ? accent : 0, logo, theme, notify, time, lang }).onConflictDoNothing()
  }
  counts.users++
}

for (const g of json.goals ?? []) {
  await db.insert(S.goal).values({
    id: g.id, userId: g.userId, title: g.title, icon: g.icon, totalDays: g.totalDays,
    startDate: g.startDate, createdAt: new Date(g.createdAt ?? Date.now()),
  }).onConflictDoNothing()
  counts.goals++
  for (const r of g.rewards ?? []) {
    await db.insert(S.reward).values({
      id: r.id, goalId: g.id, day: r.day, title: r.title, icon: r.icon || 'gift', image: r.image ?? null,
      openedAt: r.openedAt ? new Date(r.openedAt) : null,
    }).onConflictDoNothing()
    counts.rewards++
  }
  for (const [day, d] of Object.entries<any>(g.days ?? {})) {
    await db.insert(S.goalDay).values({
      goalId: g.id, day: Number(day), journal: d.journal ?? '', mood: d.mood ?? null, done: !!d.done,
      doneAt: d.doneAt ? new Date(d.doneAt) : null, updatedAt: new Date(d.updatedAt ?? Date.now()),
    }).onConflictDoNothing()
    counts.days++
  }
}
console.log('imported', counts)
