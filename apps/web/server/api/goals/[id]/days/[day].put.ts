import type { UpdateDayInput } from '#shared/types'
import { dayNumberOf } from '#shared/utils/dates'

const MOODS = new Set(['m1', 'm2', 'm3', 'm4', 'm5'])

/**
 * Save the journal for a day and/or tick it done.
 * Ticking "done" is only allowed for today — that's the core rule of the app.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const day = Number(getRouterParam(event, 'day'))
  const body = await readBody<UpdateDayInput>(event)

  return writeDb((db) => {
    const goal = findGoal(db, id, user.id)
    if (!Number.isInteger(day) || day < 1 || day > goal.totalDays)
      throw createError({ statusCode: 400, statusMessage: 'Ngày không hợp lệ' })

    const today = dayNumberOf(goal.startDate)
    if (day > today)
      throw createError({ statusCode: 403, statusMessage: 'Chưa tới ngày này' })

    const now = new Date().toISOString()
    const entry = goal.days[String(day)] ?? { journal: '', done: false, doneAt: null, updatedAt: now }

    if (typeof body?.journal === 'string') entry.journal = body.journal
    if (body?.mood === null || (typeof body?.mood === 'string' && MOODS.has(body.mood))) entry.mood = body.mood
    if (typeof body?.done === 'boolean' && body.done !== entry.done) {
      if (day !== today)
        throw createError({ statusCode: 403, statusMessage: 'Chỉ tick hoàn thành được cho hôm nay' })
      entry.done = body.done
      entry.doneAt = body.done ? now : null
    }
    entry.updatedAt = now
    goal.days[String(day)] = entry
    return goal
  })
})
