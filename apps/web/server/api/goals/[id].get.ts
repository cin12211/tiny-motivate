export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = await readDb()
  return findGoal(db, getRouterParam(event, 'id')!, user.id)
})
