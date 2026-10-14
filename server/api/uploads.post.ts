import { promises as fs } from 'node:fs'
import { extname, resolve } from 'node:path'
import { nanoid } from 'nanoid'

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const MAX_BYTES = 5 * 1024 * 1024

/** Upload a reward photo (multipart field "file"). Returns its public URL. */
export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.filename)
  if (!file) throw createError({ statusCode: 400, statusMessage: 'Không có ảnh' })
  if (!file.type || !ALLOWED.has(file.type))
    throw createError({ statusCode: 415, statusMessage: 'Chỉ nhận ảnh PNG, JPG, WEBP hoặc GIF' })
  if (file.data.length > MAX_BYTES)
    throw createError({ statusCode: 413, statusMessage: 'Ảnh tối đa 5MB' })

  const ext = extname(file.filename!).toLowerCase() || `.${file.type.split('/')[1]}`
  const name = `${nanoid(12)}${ext}`
  const dir = resolve(dataDir(), 'uploads')
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(resolve(dir, name), file.data)

  return { url: `/uploads/${name}` }
})
