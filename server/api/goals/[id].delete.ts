export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  await writeDb((db) => {
    findGoal(db, id)
    db.goals = db.goals.filter(g => g.id !== id)
  })
  return { ok: true }
})
