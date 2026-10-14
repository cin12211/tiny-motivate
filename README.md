# Motivation

Ứng dụng mini-goal kiểu TinyHabits với linh vật **Mochi** (chú kiến kawaii). Tạo mục tiêu N ngày, tự đặt phần thưởng cho từng chặng, ghi nhật ký mỗi ngày và bấm tick để hoàn thành. Lỡ một ngày không mất quà: quà mở khoá theo **tổng số ngày đã hoàn thành**.

## Công nghệ

- Nuxt 4.6.1 (Vue 3, Nitro) · Tailwind CSS v4 · shadcn-vue (theme Duolingo trong `app/assets/css/main.css`)
- Icon: Hugeicons qua `@nuxt/icon` (`<Icon name="hugeicons:gift" />`)
- Editor nhật ký: TipTap
- Backend: Nitro API + file JSON (`data/db.json`, tự tạo kèm dữ liệu mẫu ở lần chạy đầu); ảnh phần thưởng lưu ở `data/uploads/`

## Chạy

```bash
pnpm install
pnpm dev
```

Mở http://localhost:3000

## Cấu trúc

```
app/
  components/      Mochi, SplashScreen, DayStrip, RewardRoad, JournalEditor, CelebrateDialog, ...
  components/ui/   shadcn-vue components (đã chỉnh theo design)
  composables/     useGoals (state + API) và các hàm tính tiến độ
  layouts/         default: sidebar (web) / top stats + tab bar (mobile)
  pages/           index, goals/new, goals/[id], rewards, journal, profile
server/
  api/goals/...    CRUD mục tiêu, cập nhật ngày, mở quà
  api/uploads      upload ảnh phần thưởng
  utils/db.ts      JSON database
shared/            types + helpers ngày dùng chung client/server
```

## API

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/api/goals` | Danh sách mục tiêu |
| POST | `/api/goals` | Tạo mục tiêu |
| GET / DELETE | `/api/goals/:id` | Xem / xoá |
| PUT | `/api/goals/:id/days/:day` | Lưu nhật ký `{ journal }` và/hoặc tick `{ done: true }` (chỉ cho hôm nay) |
| POST | `/api/goals/:id/rewards/:rewardId/open` | Đánh dấu đã mở quà |
| POST | `/api/uploads` | Upload ảnh (multipart `file`) |
