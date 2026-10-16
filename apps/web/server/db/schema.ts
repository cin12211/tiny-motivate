import { relations } from 'drizzle-orm'
import { boolean, date, index, integer, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'

/* ------------------------------------------------------------------ */
/* Better Auth core tables (see better-auth "core schema")             */
/* ------------------------------------------------------------------ */

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
}, t => [index('session_user_idx').on(t.userId)])

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [index('account_user_idx').on(t.userId)])

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/* ------------------------------------------------------------------ */
/* Motivation                                                          */
/* ------------------------------------------------------------------ */

/** One row per user: the Settings page. */
export const userSettings = pgTable('user_settings', {
  userId: text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  accent: integer('accent').notNull().default(0),
  logo: text('logo').notNull().default('p2'),
  theme: text('theme', { enum: ['system', 'light', 'dark'] }).notNull().default('system'),
  notify: boolean('notify').notNull().default(true),
  time: text('time').notNull().default('20:00'),
  lang: text('lang', { enum: ['vi', 'en'] }).notNull().default('vi'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const goal = pgTable('goal', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  icon: text('icon').notNull(),
  totalDays: integer('total_days').notNull(),
  /** First day of the challenge (local date). */
  startDate: date('start_date', { mode: 'string' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [index('goal_user_idx').on(t.userId)])

export const reward = pgTable('reward', {
  id: text('id').primaryKey(),
  goalId: text('goal_id').notNull().references(() => goal.id, { onDelete: 'cascade' }),
  day: integer('day').notNull(),
  title: text('title').notNull(),
  icon: text('icon').notNull(),
  image: text('image'),
  openedAt: timestamp('opened_at', { withTimezone: true }),
}, t => [index('reward_goal_idx').on(t.goalId)])

/** Journal + tick for one day of a goal. */
export const goalDay = pgTable('goal_day', {
  goalId: text('goal_id').notNull().references(() => goal.id, { onDelete: 'cascade' }),
  day: integer('day').notNull(),
  journal: text('journal').notNull().default(''),
  mood: text('mood', { enum: ['m1', 'm2', 'm3', 'm4', 'm5'] }),
  done: boolean('done').notNull().default(false),
  doneAt: timestamp('done_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [primaryKey({ columns: [t.goalId, t.day] })])

export const goalRelations = relations(goal, ({ many }) => ({
  rewards: many(reward),
  days: many(goalDay),
}))
export const rewardRelations = relations(reward, ({ one }) => ({
  goal: one(goal, { fields: [reward.goalId], references: [goal.id] }),
}))
export const goalDayRelations = relations(goalDay, ({ one }) => ({
  goal: one(goal, { fields: [goalDay.goalId], references: [goal.id] }),
}))
