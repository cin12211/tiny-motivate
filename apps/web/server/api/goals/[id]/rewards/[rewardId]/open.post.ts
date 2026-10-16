export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return openReward(user.id, getRouterParam(event, 'id')!, getRouterParam(event, 'rewardId')!)
})
