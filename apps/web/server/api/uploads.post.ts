import { nanoid } from 'nanoid'

const TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
const MAX_BYTES = 5 * 1024 * 1024

/**
 * Upload a reward photo (multipart field "file"). Stored in the `uploads`
 * storage: Cloudflare R2 when deployed, ./data/uploads locally.
 */
export default defineEventHandler(async (event) => {
  await requireUser(event)
  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.filename)
  if (!file) throw createError({ statusCode: 400, statusMessage: 'Không có ảnh' })
  const ext = file.type ? TYPES[file.type] : undefined
  if (!ext) throw createError({ statusCode: 415, statusMessage: 'Chỉ nhận ảnh PNG, JPG, WEBP hoặc GIF' })
  if (file.data.length > MAX_BYTES) throw createError({ statusCode: 413, statusMessage: 'Ảnh tối đa 5MB' })

  const name = `${nanoid(12)}.${ext}`
  await useStorage('uploads').setItemRaw(name, file.data)
  return { url: `/uploads/${name}` }
})
