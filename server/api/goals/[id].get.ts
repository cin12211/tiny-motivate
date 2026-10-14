export default defineEventHandler(async (event) => {
  const db = await readDb()
  return findGoal(db, getRouterParam(event, 'id')!)
})
