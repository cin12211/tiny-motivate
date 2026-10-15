# Motivation

Ứng dụng mini-goal kiểu TinyHabits với linh vật **Mochi** (chú kiến nét mảnh). Tạo mục tiêu N ngày, tự đặt phần thưởng cho từng chặng, ghi nhật ký + cảm xúc mỗi ngày và bấm **done** để trồng một cây trong khu vườn. Lỡ một ngày không mất quà: quà mở khoá theo **tổng số ngày đã hoàn thành**.

Giao diện theo bản design **Mini Style** (nền xám, chữ IBM Plex Mono, một màu nhấn indigo, 55 icon cây + 5 hoa cảm xúc).

## Monorepo

```
apps/
  web/        Nuxt 4.6.1 + Tailwind v4 + shadcn-vue, kèm backend Nitro (JSON file DB)
  mobile/     Capacitor 8 (iOS + Android) bọc bản build tĩnh của apps/web
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

Mở http://localhost:3000. Lần chạy đầu tự tạo `apps/web/data/db.json` với tài khoản mẫu `cinny@motivation.app` / `mochi1234` và 3 mục tiêu ví dụ.

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
