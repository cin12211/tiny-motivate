export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return getGoal(user.id, getRouterParam(event, 'id')!)
})
