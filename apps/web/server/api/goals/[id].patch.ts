import type { UpdateGoalInput } from '#shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return updateGoal(user.id, getRouterParam(event, 'id')!, await readBody<UpdateGoalInput>(event))
})
