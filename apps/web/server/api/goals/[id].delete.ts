export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  await writeDb((db) => {
    findGoal(db, id, user.id)
    db.goals = db.goals.filter(g => !(g.id === id && g.userId === user.id))
  })
  return { ok: true }
})
