export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await deleteGoal(user.id, getRouterParam(event, 'id')!)
  return { ok: true }
})
