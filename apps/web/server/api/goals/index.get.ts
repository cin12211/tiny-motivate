export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return listGoals(user.id)
})
