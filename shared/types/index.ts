export interface Reward {
  id: string
  /** Number of completed days needed to unlock this reward (also where its chest sits on the road). */
  day: number
  title: string
  /** Hugeicons icon name (without the "hugeicons:" prefix), used when no photo is set. */
  icon: string
  /** Public URL of an uploaded photo, e.g. /uploads/abc.jpg */
  image?: string | null
  /** Set when the user has opened the gift after unlocking it. */
  openedAt?: string | null
}

export interface DayEntry {
  /** Rich text (HTML) written in the journal editor. */
  journal: string
  done: boolean
  doneAt?: string | null
  updatedAt: string
}

export interface Goal {
  id: string
  title: string
  icon: string
  totalDays: number
  /** First day of the challenge, YYYY-MM-DD (local date). */
  startDate: string
  rewards: Reward[]
  /** Keyed by day number (1..totalDays). */
  days: Record<string, DayEntry>
  createdAt: string
}

export interface Database {
  goals: Goal[]
}

export interface CreateGoalInput {
  title: string
  icon: string
  totalDays: number
  startDate?: string
  rewards: Array<Pick<Reward, 'day' | 'title' | 'icon' | 'image'>>
}

export interface UpdateDayInput {
  journal?: string
  done?: boolean
}
