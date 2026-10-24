import { and, asc, eq, sql } from 'drizzle-orm'
import { plantIconFor } from '@motivation/garden'
import type { Garden } from '#shared/types'
import { schema, useDb } from '../db'

const { gardenPlant, goal, goalDay } = schema

const gardenKey = (userId: string) => `garden:${userId}`
const GARDEN_TTL = 300

/** The user's garden: a plant per ticked date (cached, invalidated on change). */
export function getGarden(userId: string): Promise<Garden> {
  return cached(gardenKey(userId), GARDEN_TTL, async () => {
    const plants = await useDb().select({ date: gardenPlant.date, icon: gardenPlant.icon }).from(gardenPlant)
      .where(eq(gardenPlant.userId, userId)).orderBy(asc(gardenPlant.date))
    return { plants }
  })
}

/**
 * Keep the garden in step after a goal day changed: a tick plants the date
 * (if it has no plant yet), un-ticking the last goal ticked on that date takes
 * the plant out again.
 */
export async function syncGardenDay(userId: string, date: string, done: boolean) {
  const db = useDb()
  let changed = false
  if (done) {
    const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(gardenPlant).where(eq(gardenPlant.userId, userId))
    const inserted = await db.insert(gardenPlant)
      .values({ userId, date, icon: plantIconFor(n ?? 0, date) })
      .onConflictDoNothing()
      .returning({ date: gardenPlant.date })
    changed ||= inserted.length > 0
  }
  else {
    // another goal still ticked on this date? then the plant stays
    const [{ n }] = await db.select({ n: sql<number>`count(*)::int` })
      .from(goalDay)
      .innerJoin(goal, eq(goal.id, goalDay.goalId))
      .where(and(eq(goal.userId, userId), eq(goalDay.done, true), sql`${goal.startDate} + (${goalDay.day} - 1) = ${date}::date`))
    if (!n) {
      const removed = await db.delete(gardenPlant).where(and(eq(gardenPlant.userId, userId), eq(gardenPlant.date, date))).returning({ date: gardenPlant.date })
      changed ||= removed.length > 0
    }
  }
  if (changed) await invalidate(gardenKey(userId))
}
