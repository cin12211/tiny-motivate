import type { CreateGoalInput } from '#shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const goal = await createGoal(user.id, await readBody<CreateGoalInput>(event))
  setResponseStatus(event, 201)
  return goal
})
