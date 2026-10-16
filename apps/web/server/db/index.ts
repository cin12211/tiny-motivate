import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

/**
 * Drizzle over Neon's HTTP driver: works the same in local Node and on
 * Cloudflare Workers (no TCP sockets needed). Created lazily so Workers
 * env/secrets are available by the time the first request arrives.
 */
let _db: ReturnType<typeof create> | undefined

function create() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set (see apps/web/.env.example)')
  return drizzle(neon(url), { schema })
}

export function useDb() {
  return (_db ??= create())
}

export { schema }
