export default defineEventHandler(async (event) => {
  const token = bearerToken(event)
  if (token) {
    await writeDb((db) => {
      db.sessions = db.sessions.filter(s => s.token !== token)
    })
  }
  return { ok: true }
})
