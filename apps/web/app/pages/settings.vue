<script setup lang="ts">
import { toast } from 'vue-sonner'
import { ACCENTS, LOGOS } from '#shared/utils/settings'
import type { UserSettings } from '#shared/types'

useHead({ title: 'Cài đặt · Motivation' })

const { settings, update } = useSettings()
const { logout } = useAuth()
const open = ref<'color' | 'logo' | null>(null)

async function save(patch: Partial<UserSettings>, message?: string) {
  try {
    await update(patch)
    if (message) toast(message)
  }
  catch (err) {
    toast(errorMessage(err, 'Không lưu được cài đặt'))
  }
}

function toggle(panel: 'color' | 'logo') {
  open.value = open.value === panel ? null : panel
}

const tile = 'relative grid h-[72px] w-[124px] shrink-0 place-items-center rounded-2xl border bg-surface text-indigo shadow-[0_10px_22px_-14px_var(--m-glow)] transition-[transform,box-shadow] duration-150'
const pressable = 'hover:-translate-y-px active:scale-[.97]'
</script>

<template>
  <div>
    <!-- back bar (sticky under the web header on md+) -->
    <div class="sticky top-0 z-10 -mx-[22px] bg-gradient-to-b from-background from-75% to-transparent px-[22px] pt-4 pb-2.5 md:top-[58px] md:-mx-6 md:px-6 md:pt-3">
      <Button as-child variant="ghost" size="icon" class="text-indigo md:w-auto md:gap-1.5 md:pr-2.5 md:pl-1.5 md:text-[12.5px]" aria-label="Quay lại">
        <NuxtLink to="/"><Icon name="hugeicons:arrow-left-01" class="size-5" /><span class="hidden md:inline">tất cả mục tiêu</span></NuxtLink>
      </Button>
    </div>

    <div class="mx-auto max-w-[420px] px-1.5 pb-8">
      <div class="flex flex-col items-center gap-1.5 pt-3.5 pb-[18px] text-center">
        <LogoTile :size="64" />
        <TypographyH1 class="mt-2 text-[18px] font-semibold">cài đặt</TypographyH1>
        <TypographyMuted>tuỳ chỉnh khu vườn theo ý bạn</TypographyMuted>
      </div>

      <!-- notifications -->
      <div class="flex items-center justify-between gap-4 py-4">
        <div>
          <TypographyH2 class="mb-1.5 text-base font-medium">thông báo</TypographyH2>
          <TypographySmall as="p" class="leading-normal text-indigo opacity-85">
            <template v-if="settings.notify">nhắc bạn tick mục tiêu<br>mỗi ngày lúc này</template>
            <template v-else>đang tắt nhắc nhở</template>
          </TypographySmall>
        </div>
        <div :class="[tile, 'border-line p-1.5']">
          <input
            type="time"
            :value="settings.time"
            :disabled="!settings.notify"
            aria-label="Giờ nhắc"
            class="size-full rounded-[10px] border-0 px-2 text-center text-[17px] font-medium outline-none [&::-webkit-calendar-picker-indicator]:hidden"
            :class="settings.notify ? 'bg-primary text-primary-foreground' : 'bg-line text-muted-foreground'"
            @change="save({ time: ($event.target as HTMLInputElement).value }, `sẽ nhắc bạn lúc ${($event.target as HTMLInputElement).value} mỗi ngày`)"
          >
          <button
            type="button"
            class="absolute -top-2 -right-1.5 h-5 rounded-full border border-line bg-background px-[7px] text-[10px] text-indigo"
            :aria-label="settings.notify ? 'Tắt thông báo' : 'Bật thông báo'"
            @click="save({ notify: !settings.notify }, settings.notify ? 'đã tắt nhắc nhở' : `đã bật nhắc lúc ${settings.time}`)"
          >
            {{ settings.notify ? 'tắt' : 'bật' }}
          </button>
        </div>
      </div>

      <!-- accent colour -->
      <div class="flex items-center justify-between gap-4 py-4">
        <div>
          <TypographyH2 class="mb-1.5 text-base font-medium">màu chủ đạo</TypographyH2>
          <TypographySmall as="p" class="leading-normal text-indigo opacity-85">đổi màu nhấn cho cả app<br>đang dùng: {{ ACCENTS[settings.accent]?.[0] }}</TypographySmall>
        </div>
        <button type="button" :class="[tile, pressable, open === 'color' ? 'border-indigo' : 'border-line']" :aria-expanded="open === 'color'" aria-label="Chọn màu chủ đạo" @click="toggle('color')">
          <span class="size-[30px] rounded-full bg-primary shadow-[0_0_0_4px_var(--m-paper),0_0_0_5px_var(--m-indigo)]" />
        </button>
      </div>
      <div v-if="open === 'color'" class="-mt-1 mb-2 grid grid-cols-4 gap-x-2 gap-y-3 rounded-xl border border-dashed border-faint p-3.5">
        <button
          v-for="([name, light], i) in ACCENTS"
          :key="name"
          type="button"
          class="flex flex-col items-center gap-1.5"
          :aria-label="name"
          :aria-pressed="settings.accent === i"
          @click="save({ accent: i })"
        >
          <i
            class="block size-[30px] rounded-full"
            :style="{ background: light, boxShadow: settings.accent === i ? `0 0 0 3px var(--m-paper), 0 0 0 4.5px ${light}` : undefined }"
          />
          <TypographySmall as="span" class="text-[10.5px]" :class="settings.accent === i && 'font-semibold text-indigo'">{{ name }}</TypographySmall>
        </button>
      </div>

      <!-- logo -->
      <div class="flex items-center justify-between gap-4 py-4">
        <div>
          <TypographyH2 class="mb-1.5 text-base font-medium">logo app</TypographyH2>
          <TypographySmall as="p" class="leading-normal text-indigo opacity-85">chọn một icon trong vườn<br>làm logo của bạn</TypographySmall>
        </div>
        <button type="button" :class="[tile, pressable, open === 'logo' ? 'border-indigo' : 'border-line']" :aria-expanded="open === 'logo'" aria-label="Chọn logo" @click="toggle('logo')">
          <LogoTile :size="40" />
        </button>
      </div>
      <div v-if="open === 'logo'" class="-mt-1 mb-2 grid grid-cols-7 gap-1 rounded-xl border border-dashed border-faint p-3.5">
        <button
          v-for="id in LOGOS"
          :key="id"
          type="button"
          class="grid aspect-square place-items-center rounded-[9px] text-indigo transition-colors"
          :class="settings.logo === id ? 'bg-primary text-primary-foreground' : 'hover:bg-surface'"
          :aria-label="`logo ${id}`"
          :aria-pressed="settings.logo === id"
          @click="save({ logo: id })"
        >
          <GardenIcon :icon="id" class="size-full" />
        </button>
      </div>

      <!-- review -->
      <div class="flex items-center justify-between gap-4 py-4">
        <div>
          <TypographyH2 class="mb-1.5 text-base font-medium">đánh giá</TypographyH2>
          <TypographySmall as="p" class="leading-normal text-indigo opacity-85">để lại một đánh giá<br>trên app store :)</TypographySmall>
        </div>
        <button type="button" :class="[tile, pressable, 'border-line']" aria-label="Đánh giá app" @click="toast('cảm ơn bạn đã thương Mochi')">
          <Icon name="hugeicons:favourite" class="size-[26px]" />
        </button>
      </div>

      <!-- help -->
      <div class="flex items-center justify-between gap-4 py-4">
        <div>
          <TypographyH2 class="mb-1.5 text-base font-medium">trợ giúp</TypographyH2>
          <TypographySmall as="p" class="leading-normal text-indigo opacity-85">cần giúp đỡ?<br>gửi email cho tụi mình</TypographySmall>
        </div>
        <a href="mailto:hello@motivation.app?subject=Motivation%20-%20c%E1%BA%A7n%20gi%C3%BAp%20%C4%91%E1%BB%A1" :class="[tile, pressable, 'border-line']" aria-label="Gửi email trợ giúp">
          <GardenIcon icon="p4" class="size-[34px]" />
        </a>
      </div>

      <Button variant="ghost" size="sm" class="mx-auto mt-[22px] flex text-[11.5px]" @click="logout">
        <Icon name="hugeicons:logout-03" class="size-[15px]" /> đăng xuất
      </Button>
    </div>
  </div>
</template>
