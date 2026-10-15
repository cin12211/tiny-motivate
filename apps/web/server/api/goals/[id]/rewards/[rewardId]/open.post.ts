/** Mark an unlocked reward as opened (the "open gift" moment). */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const rewardId = getRouterParam(event, 'rewardId')!

  return writeDb((db) => {
    const goal = findGoal(db, id, user.id)
    const reward = goal.rewards.find(r => r.id === rewardId)
    if (!reward) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy phần thưởng' })

    const doneCount = Object.values(goal.days).filter(d => d.done).length
    if (doneCount < reward.day)
      throw createError({ statusCode: 403, statusMessage: 'Phần thưởng chưa mở khoá' })

    reward.openedAt ??= new Date().toISOString()
    return goal
  })
})
