/**
 * Mount the `kv` storage on Redis when REDIS_URL is set (local / VPS).
 * Without it (e.g. Cloudflare Workers, which can't open raw Redis sockets)
 * `kv` stays an in-memory storage (Nitro's default mount). The Redis driver
 * is imported lazily so the Workers bundle never loads ioredis.
 */
export default defineNitroPlugin(async () => {
  const url = process.env.REDIS_URL
  if (!url) return
  const { default: redisDriver } = await import('unstorage/drivers/redis')
  useStorage().mount('kv', redisDriver({ url, base: 'motivation' }))
})
