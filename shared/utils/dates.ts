/** Local-date helpers shared by client and server. Dates are plain YYYY-MM-DD strings. */

export function toISODate(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

export function addDays(s: string, n: number): string {
  const d = parseISODate(s)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

/** Day number (1-based) of `date` within a challenge that starts on `startDate`. */
export function dayNumberOf(startDate: string, date: string = toISODate()): number {
  const ms = parseISODate(date).getTime() - parseISODate(startDate).getTime()
  return Math.round(ms / 86_400_000) + 1
}
