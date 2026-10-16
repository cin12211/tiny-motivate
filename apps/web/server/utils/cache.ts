/**
 * Small cache helpers over the `kv` storage (Redis when configured).
 * Values are JSON; ttl in seconds.
 */
export const cacheEnabled = () => !!process.env.REDIS_URL

export async function cached<T>(key: string, ttl: number, load: () => Promise<T>): Promise<T> {
  if (!cacheEnabled()) return load()
  const storage = useStorage('kv')
  try {
    const hit = await storage.getItem<T>(key)
    if (hit !== null && hit !== undefined) return hit
  }
  catch {}
  const value = await load()
  storage.setItem(key, value as any, { ttl }).catch(() => {})
  return value
}

export async function invalidate(...keys: string[]) {
  if (!cacheEnabled()) return
  const storage = useStorage('kv')
  await Promise.all(keys.map(k => storage.removeItem(k).catch(() => {})))
}

/** Better Auth secondary storage (sessions, rate limits) backed by the same cache. */
export function authSecondaryStorage() {
  const storage = () => useStorage('kv')
  return {
    get: async (key: string) => (await storage().getItem<string>(`auth:${key}`)) ?? null,
    set: async (key: string, value: string, ttl?: number) => {
      await storage().setItem(`auth:${key}`, value, ttl ? { ttl } : undefined)
    },
    delete: async (key: string) => {
      await storage().removeItem(`auth:${key}`)
    },
    getAndDelete: async (key: string) => {
      const v = (await storage().getItem<string>(`auth:${key}`)) ?? null
      await storage().removeItem(`auth:${key}`)
      return v
    },
    increment: async (key: string, ttl: number) => {
      const n = Number((await storage().getItem(`auth:${key}`)) ?? 0) + 1
      await storage().setItem(`auth:${key}`, String(n), { ttl })
      return n
    },
  }
}
