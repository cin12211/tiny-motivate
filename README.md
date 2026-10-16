# Motivation

Ứng dụng mini-goal kiểu TinyHabits với linh vật **Mochi** (chú kiến nét mảnh). Tạo mục tiêu N ngày, tự đặt phần thưởng cho từng chặng, ghi nhật ký + cảm xúc mỗi ngày và bấm **done** để trồng một cây trong khu vườn. Lỡ một ngày không mất quà: quà mở khoá theo **tổng số ngày đã hoàn thành**.

Giao diện theo bản design **Mini Style** (nền xám, chữ IBM Plex Mono, một màu nhấn indigo, 55 icon cây + 5 hoa cảm xúc).

## Monorepo

```
apps/
  web/        Nuxt 4.6.1 + Tailwind v4 + shadcn-vue, kèm backend Nitro (Postgres/Neon + Drizzle + Better Auth)
  mobile/     Capacitor 6 (iOS + Android, chạy được với Xcode 15) bọc bản build tĩnh của apps/web
packages/
  garden/     @motivation/garden: 55 icon cây + 5 icon cảm xúc (SVG currentColor)
```

pnpm workspace, cài một lần ở thư mục gốc:

```bash
pnpm install
```

## Chạy web

```bash
pnpm dev
```

Mở http://localhost:3000. Cần cấu hình database trước (xem phần Database bên dưới). Tài khoản mẫu: `cinny@motivation.app` / `mochi1234`.

## App mobile (Capacitor)

App native chạy bản SPA tĩnh, gọi API tới server Nitro ở `NUXT_PUBLIC_API_BASE`:

```bash
# 1. chạy server API (máy tính và điện thoại cùng mạng)
pnpm dev --host

# 2. build bản mobile trỏ vào server đó rồi đồng bộ sang iOS/Android
NUXT_PUBLIC_API_BASE=http://192.168.1.10:3000 pnpm mobile:build

# 3. mở Xcode / Android Studio
pnpm mobile:ios
pnpm mobile:android
```

Live reload khi dev: `CAP_SERVER_URL=http://192.168.1.10:3000 pnpm --filter @motivation/mobile sync`.

## Database (Neon Postgres + Drizzle)

- Schema: `apps/web/server/db/schema.ts` (bảng của Better Auth + `user_settings`, `goal`, `goal_day`, `reward`).
- Cấu hình: copy `apps/web/.env.example` thành `apps/web/.env` rồi điền `DATABASE_URL` (URL pooled của Neon), `DATABASE_URL_UNPOOLED` (URL direct, dùng cho migration), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.

```bash
pnpm --filter @motivation/web db:generate   # tạo migration mới sau khi sửa schema
pnpm --filter @motivation/web db:migrate    # áp migration lên Neon
pnpm --filter @motivation/web db:studio     # xem dữ liệu
pnpm --filter @motivation/web db:import-json   # (một lần) nhập dữ liệu cũ từ data/db.json
```

Đăng nhập dùng Better Auth (`/api/auth/*`, email + mật khẩu). App mobile nhận token qua header `set-auth-token` và gửi lại bằng `Authorization: Bearer`.

## Đăng nhập Google + Redis cache

- Google: điền `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` trong `apps/web/.env` (khi deploy: `wrangler secret put`). Trong Google Cloud Console, thêm Authorized redirect URI `<BETTER_AUTH_URL>/api/auth/callback/google` (local: `http://localhost:3000/api/auth/callback/google`). Luồng: `/api/oauth/start` → Google → `/api/oauth/done` → web `/auth/callback` hoặc app iOS `motivation://auth`.
- Redis: `REDIS_URL` trong `.env` bật cache cho phiên đăng nhập (Better Auth secondary storage) và danh sách mục tiêu. Cloudflare Workers không kết nối được Redis thường, nên bản deploy Cloudflare chạy không có cache này.

## Deploy lên Cloudflare Workers + R2

Ảnh phần quà lưu trong R2 (binding `BUCKET`); khi chạy local thì lưu ở `apps/web/data/uploads`.

```bash
cd apps/web
npx wrangler login
npx wrangler r2 bucket create motivation-uploads
npx wrangler secret put DATABASE_URL
npx wrangler secret put BETTER_AUTH_SECRET
# sửa BETTER_AUTH_URL trong wrangler.jsonc thành URL thật của Worker, rồi:
pnpm deploy:cloudflare
```

Chạy thử bản Cloudflare trên máy: tạo `apps/web/.dev.vars` (giống `.env`) rồi `pnpm --filter @motivation/web preview:cloudflare`.

## Web app (apps/web)

- `app/components/typography/` — Typography components theo shadcn-vue (`TypographyH1…H4`, `P`, `Lead`, `Large`, `Small`, `Muted`, `Blockquote`, `List`, `InlineCode`, `Hand`). Mọi text trong UI dùng các component này.
- `app/components/ui/` — shadcn-vue components đã chỉnh theo Mini Style.
- Icon giao diện: Hugeicons qua `@nuxt/icon` (được bundle vào client để chạy offline trong app).
- Font IBM Plex Mono + Caveat bundle qua `@fontsource`.

### API

| Method | Path | Mô tả |
| --- | --- | --- |
| POST | `/api/auth/signup` | Đăng ký `{ name, email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | Đăng nhập `{ email, password }` → `{ token, user }` |
| POST | `/api/auth/logout` | Huỷ token hiện tại |
| GET | `/api/auth/me` | Người dùng hiện tại |
| GET / POST | `/api/goals` | Danh sách / tạo mục tiêu |
| GET / DELETE | `/api/goals/:id` | Xem / xoá |
| PUT | `/api/goals/:id/days/:day` | Lưu `{ journal, mood }` và/hoặc tick `{ done }` (chỉ cho hôm nay) |
| POST | `/api/goals/:id/rewards/:rewardId/open` | Đánh dấu đã mở quà |
| POST | `/api/uploads` | Upload ảnh phần quà (multipart `file`) |

Các route (trừ auth) cần header `Authorization: Bearer <token>`. CORS mở cho app Capacitor.
