# Better Auth Admin Plugin & Admin Dashboard Design Spec

## 1. Overview & Goals
Integrate Better Auth's official `admin` plugin into the application backend and database, and provide a full-stack administration experience with user search, role management (`admin` / `user`), and user banning / unbanning.

Key goals:
* Register the Better Auth `admin()` plugin on the server.
* Extend the Drizzle schema (`user` and `session` tables) and generate a migration.
* Provide initial admin bootstrapping via `ADMIN_EMAILS` environment variable and a CLI script (`pnpm db:make-admin <email>`).
* Maintain compatibility with custom fast-auth caching (JWT in `x-auth-jwt` and L1 cache) and mobile Capacitor bearer token auth.
* Protect administrative routes and actions with role-based checks (`role === 'admin'`).
* Create a dedicated `/admin` dashboard in Nuxt styled consistently with the application design.

---

## 2. Architecture & Data Model

### 2.1 Drizzle Database Schema (`apps/web/server/db/schema.ts`)
Add the following fields required by Better Auth's `admin` plugin:

1. **`user` table**:
   * `role`: `text('role').notNull().default('user')`
   * `banned`: `boolean('banned').notNull().default(false)`
   * `banReason`: `text('ban_reason')`
   * `banExpires`: `timestamp('ban_expires', { withTimezone: true })`

2. **`session` table**:
   * `impersonatedBy`: `text('impersonated_by')`

### 2.2 Database Migration
* Run `pnpm --filter @motivation/web db:generate` to generate the SQL migration file in `apps/web/server/db/migrations/`.
* All new columns are either nullable or have default values (`'user'`, `false`), ensuring existing users and sessions remain fully valid.

---

## 3. Server Configuration & Authentication

### 3.1 Better Auth Plugin (`apps/web/server/utils/auth.ts`)
* Import `admin` from `better-auth/plugins`.
* Register `admin({ defaultRole: 'user', adminRole: 'admin' })` in `betterAuth({ plugins: [...] })`.
* Pass extended table schemas to `drizzleAdapter`.

### 3.2 Types & Fast-Auth Updates
1. **Shared Types (`apps/web/shared/types/index.ts`)**:
   ```ts
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
   ```
2. **Current User Endpoint (`apps/web/server/api/me.get.ts`)**:
   Return `role`, `banned`, `banReason`, and `banExpires` alongside user and settings.
3. **Fast-Auth (`apps/web/server/utils/fast-auth.ts`)**:
   * Add `role: string` and `banned?: boolean` to `FastUser`.
   * Embed `role` and `banned` into the signed JWT payload.
   * If `user.banned` is true during token verification or session loading, immediately deny access with `403 Forbidden`.
4. **Auto-Promotion via `ADMIN_EMAILS`**:
   * Inspect comma-separated `ADMIN_EMAILS` env variable.
   * During sign-in or session loading in `requireUser`, if `user.email` is included in `ADMIN_EMAILS` and `user.role !== 'admin'`, update `user.role` to `'admin'`.

### 3.3 CLI Admin Promotion Script (`apps/web/scripts/make-admin.ts`)
* Script executable via `pnpm db:make-admin <email>`.
* Queries user by email in PostgreSQL, updates `role = 'admin'`, and prints the outcome.
* Registered in `apps/web/package.json` scripts: `"db:make-admin": "node --import tsx/esm scripts/make-admin.ts"`.

---

## 4. Admin Dashboard & Frontend

### 4.1 Route Guard (`apps/web/app/middleware/admin.ts`)
* Middleware applied to `/admin` routes.
* Verifies `const { user } = useAuth()`.
* If `!user.value || user.value.role !== 'admin'`, redirects to `/` with an unauthorized alert.

### 4.2 Admin Composable (`apps/web/app/composables/useAdmin.ts`)
Provides structured client wrappers around Better Auth's `/api/auth/admin/*` endpoints via `useApi()`:
* `listUsers(params: { limit?: number, offset?: number, searchValue?: string })`: Calls `/api/auth/admin/list-users`.
* `setRole(userId: string, role: string)`: Calls `/api/auth/admin/set-role`.
* `banUser(userId: string, banReason?: string, banExpiresIn?: number)`: Calls `/api/auth/admin/ban-user`.
* `unbanUser(userId: string)`: Calls `/api/auth/admin/unban-user`.

### 4.3 Admin Dashboard Page (`apps/web/app/pages/admin/index.vue`)
* Layout & Aesthetics: Matches application styling (Tailwind, Reka UI / Radix primitives, font tokens, and color system).
* Controls:
  * Search bar for user email and name (debounced).
  * Status badges: Admin badge (indigo/primary), User badge (muted), Banned badge (destructive red).
  * Role action: Promote to admin or demote to user (with prompt / confirmation).
  * Ban / Unban actions:
    * Modal to enter ban reason and duration (7 days, 30 days, or permanent).
    * One-click unban for banned accounts.
  * Pagination: Offset / Limit navigation with total records count.

### 4.4 Settings Navigation Entry (`apps/web/app/pages/settings.vue`)
* In the Settings menu, when `user?.role === 'admin'`, render an "Admin Dashboard" card linking to `/admin`.

---

## 5. Verification Plan

1. **Schema & Migration Verification**:
   * Generate migration and inspect generated SQL for `user` columns (`role`, `banned`, `banReason`, `banExpires`) and `session.impersonatedBy`.
   * Apply migration or verify compatibility with existing tests/build.
2. **Server Auth & API Verification**:
   * Verify Better Auth boots with `admin()` without errors.
   * Verify `/api/auth/admin/list-users` requires admin credentials (returns 403 / 401 for normal users).
3. **CLI Script Verification**:
   * Test running `pnpm db:make-admin <email>` with valid and invalid emails.
4. **Dashboard & UI Verification**:
   * Navigate to `/admin` as non-admin -> verified redirected to `/`.
   * Navigate to `/admin` as admin -> renders user list, search works, pagination works.
   * Change user role -> updates immediately in UI and database.
   * Ban user -> marks user as banned and prevents sign-in / access.
   * Unban user -> restores access.
