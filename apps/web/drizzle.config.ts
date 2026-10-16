import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

// Migrations use Neon's direct (non-pooled) host; the app uses the pooled one.
export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL! },
  strict: true,
})
