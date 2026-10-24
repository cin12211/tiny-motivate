export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return getGarden(user.id)
})
