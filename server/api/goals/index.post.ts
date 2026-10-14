import { nanoid } from 'nanoid'
import type { CreateGoalInput, Goal } from '#shared/types'
import { toISODate } from '#shared/utils/dates'

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateGoalInput>(event)

  const title = body?.title?.trim()
  const totalDays = Math.floor(Number(body?.totalDays))
  if (!title) throw createError({ statusCode: 400, statusMessage: 'Cần đặt tên cho mục tiêu' })
  if (!Number.isFinite(totalDays) || totalDays < 1 || totalDays > 365)
    throw createError({ statusCode: 400, statusMessage: 'Số ngày phải từ 1 đến 365' })

  const rewards = (body.rewards ?? [])
    .filter(r => r.title?.trim())
    .map(r => ({
      id: nanoid(8),
      day: Math.min(totalDays, Math.max(1, Math.floor(Number(r.day)))),
      title: r.title.trim(),
      icon: r.icon || 'gift',
      image: r.image || null,
      openedAt: null,
    }))
    .sort((a, b) => a.day - b.day)

  const goal: Goal = {
    id: nanoid(10),
    title,
    icon: body.icon || 'target-02',
    totalDays,
    startDate: body.startDate || toISODate(),
    rewards,
    days: {},
    createdAt: new Date().toISOString(),
  }

  await writeDb((db) => {
    db.goals.unshift(goal)
  })
  setResponseStatus(event, 201)
  return goal
})
