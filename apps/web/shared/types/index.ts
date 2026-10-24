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

export type MoodId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5'

export interface DayEntry {
  /** Rich text (HTML) written in the journal editor. */
  journal: string
  /** "How did today feel?" — one of the 5 mood flowers. */
  mood?: MoodId | null
  done: boolean
  doneAt?: string | null
  updatedAt: string
}

export interface Goal {
  id: string
  userId: string
  title: string
  icon: string
  totalDays: number
  /** First day of the challenge, YYYY-MM-DD (local date). */
  startDate: string
  /** Daily reminder for this goal, HH:MM (local), or null for none. */
  remind: string | null
  rewards: Reward[]
  /** Keyed by day number (1..totalDays). */
  days: Record<string, DayEntry>
  createdAt: string
}

/** Per-user preferences from the Settings page. */
export interface UserSettings {
  /** Index into ACCENTS (shared/utils/settings.ts). */
  accent: number
  /** Garden icon id used as the app logo, e.g. "forest", "p4", "m2". */
  logo: string
  /** Light / dark appearance, or follow the device. */
  theme: 'system' | 'light' | 'dark'
  /** Display language. */
  lang: 'vi' | 'en'
  /** Daily reminder on/off and its time (HH:MM, local). */
  notify: boolean
  time: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  banned?: boolean
  banReason?: string | null
  banExpires?: string | null
  createdAt: string
  settings: UserSettings
}


export interface CreateGoalInput {
  title: string
  icon: string
  totalDays: number
  startDate?: string
  remind?: string | null
  rewards: Array<Pick<Reward, 'day' | 'title' | 'icon' | 'image'>>
}

/** The user's garden (kept apart from goals). */
export interface Garden {
  /** one plant per date with at least one tick; icon fixed once grown */
  plants: Array<{ date: string, icon: string }>
}

export interface UpdateGoalInput {
  remind?: string | null
}

export interface UpdateDayInput {
  journal?: string
  done?: boolean
  mood?: MoodId | null
}
