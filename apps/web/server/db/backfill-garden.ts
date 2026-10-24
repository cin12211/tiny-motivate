/**
 * One-off: fill the garden table (garden_plant) from the goals
 * people already have, so their garden and plant book look exactly as before
 * (the icons are the ones the app showed until now). Safe to re-run: rows
 * already there are left untouched.
 *
 *   pnpm --filter @motivation/web db:backfill-garden            # every user
 *   pnpm --filter @motivation/web db:backfill-garden <email>    # one user
 */
import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, inArray } from 'drizzle-orm'
import { gardenIcons } from '@motivation/garden'
import * as schema from './schema.ts'

const db = drizzle(neon(process.env.DATABASE_URL!), { schema })
const { user, goal, goalDay, gardenPlant } = schema

const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(Date.UTC(y!, m! - 1, d! + n))
  return t.toISOString().slice(0, 10)
}

const only = process.argv[2]
const users = only
  ? await db.select({ id: user.id }).from(user).where(eq(user.email, only))
  : await db.select({ id: user.id }).from(user)

let plants = 0
for (const { id } of users) {
  const goals = await db.select().from(goal).where(eq(goal.userId, id))
  if (!goals.length) continue
  const days = await db.select().from(goalDay).where(inArray(goalDay.goalId, goals.map(g => g.id)))
  const start = new Map(goals.map(g => [g.id, g.startDate]))
  const done = new Set<string>()
  for (const d of days) {
    const date = addDays(start.get(d.goalId)!, d.day - 1)
    if (d.done) done.add(date)
  }
  const iconFor = gardenIcons(done)
  const plantRows = [...done].sort().map(date => ({ userId: id, date, icon: iconFor(date) }))
  if (plantRows.length) plants += (await db.insert(gardenPlant).values(plantRows).onConflictDoNothing().returning({ d: gardenPlant.date })).length
}
console.log(`users: ${users.length}, plants added: ${plants}`)
