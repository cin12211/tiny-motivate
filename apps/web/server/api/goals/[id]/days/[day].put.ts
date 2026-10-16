import type { UpdateDayInput } from '#shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const day = Number(getRouterParam(event, 'day'))
  return updateDay(user.id, getRouterParam(event, 'id')!, day, await readBody<UpdateDayInput>(event))
})
