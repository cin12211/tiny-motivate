import { promises as fs } from 'node:fs'
import { basename, extname, resolve } from 'node:path'

const TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

/** Serve uploaded reward photos from ./data/uploads. */
export default defineEventHandler(async (event) => {
  const name = basename(getRouterParam(event, 'name') || '')
  const type = TYPES[extname(name).toLowerCase()]
  if (!type) throw createError({ statusCode: 404 })

  try {
    const data = await fs.readFile(resolve(dataDir(), 'uploads', name))
    setHeader(event, 'Content-Type', type)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    return data
  }
  catch {
    throw createError({ statusCode: 404 })
  }
})
