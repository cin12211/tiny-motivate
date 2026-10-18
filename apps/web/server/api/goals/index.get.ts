export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return timed(event, "goals", () => listGoals(user.id))
})
