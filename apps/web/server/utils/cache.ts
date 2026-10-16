/**
 * Small cache helpers over the `kv` storage, used for goal lists, settings and
 * Better Auth sessions. Values are JSON; ttl in seconds.
 * - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN → Upstash over HTTP
 *   (works on Cloudflare Workers, which can't open raw Redis sockets)
 * - REDIS_URL → a plain Redis server (local / VPS)
 * The driver is mounted on first use, not in a plugin: on Workers the env vars
 * only exist once a request is being handled.
 */
export const cacheEnabled = () => !!(process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL)

let mounting: Promise<void> | undefined
async function mountKv() {
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token, REDIS_URL } = process.env
  if (url && token) {
    const { default: upstashDriver } = await import('unstorage/drivers/upstash')
    useStorage().mount('kv', upstashDriver({ url, token, base: 'motivation' }))
  }
  else if (REDIS_URL) {
    const { default: redisDriver } = await import('unstorage/drivers/redis')
    useStorage().mount('kv', redisDriver({ url: REDIS_URL, base: 'motivation' }))
  }
}
async function kv() {
  mounting ??= mountKv().catch((err) => {
    mounting = undefined
    throw err
  })
  await mounting
  return useStorage('kv')
}

export async function cached<T>(key: string, ttl: number, load: () => Promise<T>): Promise<T> {
  if (!cacheEnabled()) return load()
  let storage: Awaited<ReturnType<typeof kv>>
  try {
    storage = await kv()
  }
  catch (err) {
    console.error('[cache] storage unavailable', err)
    return load()
  }
  try {
    const hit = await storage.getItem<T>(key)
    if (hit !== null && hit !== undefined) return hit
  }
  catch {}
  const value = await load()
  // awaited: on Workers, work left running after the response is dropped
  await storage.setItem(key, value as any, { ttl }).catch(() => {})
  return value
}

export async function invalidate(...keys: string[]) {
  if (!cacheEnabled()) return
  const storage = await kv()
  await Promise.all(keys.map(k => storage.removeItem(k).catch(() => {})))
}

/** Better Auth secondary storage (sessions, rate limits) backed by the same cache. */
export function authSecondaryStorage() {
  const storage = kv
  return {
    get: async (key: string) => (await (await storage()).getItem<string>(`auth:${key}`)) ?? null,
    set: async (key: string, value: string, ttl?: number) => {
      await (await storage()).setItem(`auth:${key}`, value, ttl ? { ttl } : undefined)
    },
    delete: async (key: string) => {
      await (await storage()).removeItem(`auth:${key}`)
    },
    getAndDelete: async (key: string) => {
      const v = (await (await storage()).getItem<string>(`auth:${key}`)) ?? null
      await (await storage()).removeItem(`auth:${key}`)
      return v
    },
    increment: async (key: string, ttl: number) => {
      const n = Number((await (await storage()).getItem(`auth:${key}`)) ?? 0) + 1
      await (await storage()).setItem(`auth:${key}`, String(n), { ttl })
      return n
    },
  }
}
