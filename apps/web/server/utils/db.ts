import { promises as fs } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { Database, Goal } from '#shared/types'
import { addDays, toISODate } from '#shared/utils/dates'
import { hashPassword } from './auth'

/**
 * Tiny JSON-file "database". Good enough for a prototype:
 * reads the whole file, mutates in memory, writes it back atomically.
 * Writes are serialised through a promise chain so concurrent requests
 * never clobber each other.
 */

export const DEMO_EMAIL = 'cinny@motivation.app'
export const DEMO_PASSWORD = 'mochi1234'

export function dataDir() {
  return resolve(process.cwd(), useRuntimeConfig().dataDir || './data')
}

function dbPath() {
  return resolve(dataDir(), 'db.json')
}

let queue: Promise<unknown> = Promise.resolve()

async function load(): Promise<Database> {
  let db: Database
  try {
    db = JSON.parse(await fs.readFile(dbPath(), 'utf8'))
  }
  catch (err: any) {
    if (err?.code !== 'ENOENT') throw err
    db = seed()
    await save(db)
    return db
  }
  if (migrate(db)) await save(db)
  return db
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

export function findGoal(db: Database, id: string, userId: string): Goal {
  const goal = db.goals.find(g => g.id === id && g.userId === userId)
  if (!goal) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy mục tiêu' })
  return goal
}

/** Upgrade files written by older versions (no accounts yet → give goals to the demo user). */
function migrate(db: Database): boolean {
  if (db.users && db.sessions) return false
  const demo = demoUser()
  db.users = [demo]
  db.sessions = []
  for (const g of db.goals ?? []) g.userId ??= demo.id
  db.goals ??= []
  return true
}

function demoUser() {
  const { hash, salt } = hashPassword(DEMO_PASSWORD)
  return {
    id: 'u-cinny',
    name: 'cinny',
    email: DEMO_EMAIL,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
  }
}

/** Sample data (same as the design prototype) so the app isn't empty on first launch. */
function seed(): Database {
  const today = toISODate()
  const now = new Date().toISOString()
  const user = demoUser()
  const entry = (journal: string, mood: 'm1' | 'm2' | 'm3' | 'm4' | 'm5' = 'm2') =>
    ({ journal, mood, done: true, doneAt: now, updatedAt: now })

  const english: Goal = {
    id: 'demo-english',
    userId: user.id,
    title: 'Học tiếng Anh mỗi ngày',
    icon: 'books-01',
    totalDays: 30,
    startDate: addDays(today, -8),
    createdAt: now,
    days: {
      1: entry('<p>Học 20 từ vựng chủ đề <strong>du lịch</strong>. Nghe 1 tập podcast 6 Minute English.</p>'),
      2: entry('<p>Ôn lại 20 từ hôm qua, nhớ được 16 từ.</p>'),
      3: entry('<ul><li><p>Shadowing 15 phút</p></li><li><p>Viết 5 câu với thì hiện tại hoàn thành</p></li></ul><p>Hôm nay được ly trà sữa rồi!</p>', 'm5'),
      4: entry('<p>Xem 1 video TED có phụ đề tiếng Anh.</p>'),
      5: entry('<p>Hơi mệt nên chỉ học 15 phút từ vựng.</p>', 'm3'),
      6: entry('<p>Luyện nói với bạn qua video call 20 phút. <em>Ngại nhưng vui.</em></p>', 'm4'),
      7: entry('<p>Hoàn thành bài test ngữ pháp, đúng 18/25. Tối nay đi ăn nhà hàng!</p>', 'm5'),
      8: entry('<p>Đọc 2 trang truyện ngắn bằng tiếng Anh.</p>'),
    },
    rewards: [
      { id: 'r1', day: 3, title: '1 ly trà sữa', icon: 'bubble-tea-01', image: null, openedAt: now },
      { id: 'r2', day: 7, title: 'Bữa ăn nhà hàng', icon: 'restaurant-01', image: null, openedAt: now },
      { id: 'r3', day: 21, title: 'Đi chơi Hội An', icon: 'lantern', image: null },
      { id: 'r4', day: 30, title: 'Máy đọc sách', icon: 'tablet-01', image: null },
    ],
  }

  const running: Goal = {
    id: 'demo-run',
    userId: user.id,
    title: 'Chạy bộ buổi sáng',
    icon: 'workout-run',
    totalDays: 21,
    startDate: addDays(today, -2),
    createdAt: now,
    days: {
      1: entry('<p>Chạy 2km quanh hồ.</p>', 'm3'),
      2: entry('<p>2.5km, đỡ mệt hơn hôm qua.</p>'),
    },
    rewards: [
      { id: 'r5', day: 7, title: 'Đôi tất chạy mới', icon: 'socks', image: null },
      { id: 'r6', day: 21, title: 'Giày chạy bộ', icon: 'running-shoes', image: null },
    ],
  }

  const soda: Goal = {
    id: 'demo-soda',
    userId: user.id,
    title: 'Không uống nước ngọt',
    icon: 'soft-drink-01',
    totalDays: 14,
    startDate: addDays(today, -13),
    createdAt: now,
    days: Object.fromEntries(Array.from({ length: 13 }, (_, i) => [String(i + 1), entry('<p>Chỉ uống nước lọc và trà.</p>')])),
    rewards: [
      { id: 'r7', day: 14, title: 'Vé xem phim', icon: 'film-roll-01', image: null },
    ],
  }

  return { users: [user], sessions: [], goals: [english, running, soda] }
}
