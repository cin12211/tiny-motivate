import { basename, extname } from 'pathe'

const TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

/** Serve uploaded reward photos from the `uploads` storage (R2 or local disk). */
export default defineEventHandler(async (event) => {
  const name = basename(getRouterParam(event, 'name') || '')
  const type = TYPES[extname(name).toLowerCase()]
  if (!type) throw createError({ statusCode: 404 })
  const data = await useStorage('uploads').getItemRaw(name)
  if (!data) throw createError({ statusCode: 404 })
  setHeader(event, 'Content-Type', type)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return data
})
