import { promises as fs } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { Database, Goal } from '#shared/types'
import { addDays, toISODate } from '#shared/utils/dates'

/**
 * Tiny JSON-file "database". Good enough for a single-user prototype:
 * reads the whole file, mutates in memory, writes it back atomically.
 * Writes are serialised through a promise chain so concurrent requests
 * never clobber each other.
 */

export function dataDir() {
  return resolve(process.cwd(), useRuntimeConfig().dataDir || './data')
}

function dbPath() {
  return resolve(dataDir(), 'db.json')
}

let queue: Promise<unknown> = Promise.resolve()

async function load(): Promise<Database> {
  try {
    const raw = await fs.readFile(dbPath(), 'utf8')
    return JSON.parse(raw) as Database
  }
  catch (err: any) {
    if (err?.code !== 'ENOENT') throw err
    const seeded = seed()
    await save(seeded)
    return seeded
  }
}

async function save(db: Database) {
  const file = dbPath()
  await fs.mkdir(dirname(file), { recursive: true })
  const tmp = `${file}.tmp`
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), 'utf8')
  await fs.rename(tmp, file)
}

export async function readDb(): Promise<Database> {
  await queue
  return load()
}

/** Run a mutation against the database and persist it. */
export function writeDb<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await load()
    const result = await fn(db)
    await save(db)
    return result
  })
  queue = run.catch(() => {})
  return run
}

export function findGoal(db: Database, id: string): Goal {
  const goal = db.goals.find(g => g.id === id)
  if (!goal) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy mục tiêu' })
  return goal
}

/** Sample data so the app isn't empty on first launch. */
function seed(): Database {
  const today = toISODate()
  const now = new Date().toISOString()
  const startDate = addDays(today, -5)
  const days: Goal['days'] = {}
  for (const n of [1, 2, 3, 5]) {
    days[String(n)] = {
      journal: `<p>Ngày ${n}: học 20 từ mới và nghe 1 podcast.</p>`,
      done: true,
      doneAt: now,
      updatedAt: now,
    }
  }
  return {
    goals: [
      {
        id: 'demo-english',
        title: 'Học tiếng Anh mỗi ngày',
        icon: 'book-open-01',
        totalDays: 30,
        startDate,
        createdAt: now,
        days,
        rewards: [
          { id: 'r1', day: 3, title: 'Ly trà sữa', icon: 'bubble-tea-01', image: null, openedAt: now },
          { id: 'r2', day: 7, title: 'Bữa ăn nhà hàng', icon: 'restaurant-01', image: null },
          { id: 'r3', day: 14, title: 'Đi chơi Hội An', icon: 'airplane-01', image: null },
          { id: 'r4', day: 30, title: 'Máy đọc sách', icon: 'books-01', image: null },
        ],
      },
      {
        id: 'demo-gym',
        title: 'Tập thể dục 15 phút',
        icon: 'dumbbell-01',
        totalDays: 14,
        startDate: addDays(today, -1),
        createdAt: now,
        days: {
          1: { journal: '<p>Chạy bộ 15 phút quanh hồ.</p>', done: true, doneAt: now, updatedAt: now },
        },
        rewards: [
          { id: 'r5', day: 5, title: 'Đôi giày mới', icon: 'running-shoes', image: null },
          { id: 'r6', day: 14, title: 'Buổi spa thư giãn', icon: 'yoga-01', image: null },
        ],
      },
    ],
  }
}
