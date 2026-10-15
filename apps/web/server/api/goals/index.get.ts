export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = await readDb()
  return db.goals.filter(g => g.userId === user.id)
})
