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
  // Local disk (Node) gives a Buffer, which h3 sends as-is. R2 (Workers) gives an
  // ArrayBuffer, which h3 would mangle - hand that over as a web Response instead.
  if (Buffer.isBuffer(data)) return data
  return new Response(data as BodyInit, { headers: getResponseHeaders(event) as HeadersInit })
})
