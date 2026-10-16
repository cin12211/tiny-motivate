<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { growIconForDate } from '@motivation/garden'
import { addDays, dayNumberOf, toISODate } from '#shared/utils/dates'

/**
 * One day across all goals (opened from a garden cell on home): what grew,
 * which goals were done, mood and the start of each journal. ‹ › / the date
 * chip calendar / swipe (mobile) / ← → keys (web) move between days; future
 * days are off limits.
 */
const route = useRoute()
const { t } = useI18n()
const { goals } = useGoals()
const today = toISODate()

const date = computed(() => {
  const d = String(route.params.date || '')
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && d <= today ? d : today
})
useHead({ title: () => `${dotDate(date.value)} · Motivation` })

function go(iso: string) {
  if (iso > today || iso === date.value) return
  navigateTo(`/day/${iso}`, { replace: true })
}
const shift = (n: number) => go(addDays(date.value, n))
const picked = computed({ get: () => date.value, set: go })

const chipLabel = computed(() =>
  date.value === today ? t('common.today') : `${t(`weekdays.${weekdayIndex(date.value)}`)} · ${dotDate(date.value)}`)

/** Goals running that day (day index 1..totalDays) with that day's entry. */
const rows = computed(() => goals.value
  .map((g) => {
    const day = dayNumberOf(g.startDate, date.value)
    const entry = g.days[String(day)]
    const text = (entry?.journal ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
    return { goal: g, day, entry, text: text.length > 140 ? `${text.slice(0, 140)}…` : text }
  })
  .filter(r => r.day >= 1 && r.day <= r.goal.totalDays))
const doneCount = computed(() => rows.value.filter(r => r.entry?.done).length)

function doneOn(iso: string) {
  return goals.value.some((g) => {
    const k = dayNumberOf(g.startDate, iso)
    return k >= 1 && k <= g.totalDays && !!g.days[String(k)]?.done
  })
}

/* ---------- change day: keys (web) + swipe (mobile) ---------- */
onKeyStroke(['ArrowLeft', 'ArrowRight'], (e) => {
  const el = e.target as HTMLElement | null
  if (el?.closest('input, textarea, [contenteditable="true"]')) return
  shift(e.key === 'ArrowLeft' ? -1 : 1)
})
let startX = 0
let startY = 0
function onTouchStart(e: TouchEvent) {
  startX = e.touches[0]!.clientX
  startY = e.touches[0]!.clientY
}
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0]!.clientX - startX
  const dy = e.changedTouches[0]!.clientY - startY
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) shift(dx < 0 ? 1 : -1)
}
</script>

<template>
  <div class="min-h-[70dvh]" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
    <!-- top bar: back · ‹ date chip › -->
    <div class="sticky top-0 z-10 -mx-[22px] flex items-center justify-between bg-gradient-to-b from-background from-75% to-transparent px-[22px] pt-3.5 pb-2.5 md:-mx-7 md:px-7 max-[860px]:md:-mx-4 max-[860px]:md:px-4">
      <Button as-child variant="ghost" size="icon" class="text-indigo md:w-auto md:gap-1.5 md:pr-2.5 md:pl-1.5 md:text-[12.5px]" :aria-label="$t('common.back')">
        <NuxtLink to="/"><HandIcon name="arrow-left-01" /><span class="hidden md:inline">{{ $t('common.allGoals') }}</span></NuxtLink>
      </Button>
      <div class="flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon-sm" class="text-indigo" :aria-label="$t('day.prev')" @click="shift(-1)"><HandIcon name="arrow-left-01" /></Button>
        <CalendarChip v-model="picked" :label="chipLabel" :max="today" :marked="doneOn">
          <TypographyMuted as="small" class="pt-2 text-[10.5px] dashed-top">• {{ $t('day.legend') }}</TypographyMuted>
        </CalendarChip>
        <Button type="button" variant="ghost" size="icon-sm" class="text-indigo" :disabled="date === today" :aria-label="$t('day.next')" @click="shift(1)"><HandIcon name="arrow-left-01" class="-scale-x-100" /></Button>
      </div>
      <span class="w-9 md:w-[120px]" />
    </div>

    <div class="mx-auto max-w-[560px]">
      <!-- hero -->
      <div class="flex flex-col items-center gap-2 pt-4 pb-5 text-center">
        <span class="grid size-24 place-items-center text-indigo">
          <GardenIcon v-if="doneCount" :icon="growIconForDate(date)" class="size-24" />
          <i v-else class="block size-2 rounded-full bg-indigo opacity-40" />
        </span>
        <TypographyP>
          <template v-if="!rows.length">{{ $t('day.noGoals') }}</template>
          <i18n-t v-else-if="doneCount" keypath="day.grew" tag="span" scope="global">
            <template #plant><em>{{ $t('day.onePlant') }}</em></template>
            <template #done>{{ doneCount }}</template>
            <template #total>{{ rows.length }}</template>
          </i18n-t>
          <template v-else>{{ $t('day.nothing', { total: rows.length }) }}</template>
        </TypographyP>
      </div>

      <!-- goals of that day -->
      <section v-if="rows.length" class="flex flex-col">
        <Badge class="mb-1 self-center">{{ $t('day.goals') }}</Badge>
        <NuxtLink
          v-for="r in rows"
          :key="r.goal.id"
          :to="`/goals/${r.goal.id}?day=${r.day}`"
          class="group flex flex-col gap-1.5 px-1 py-3.5 dashed-bottom last:border-b-0 md:rounded-[10px] md:px-3.5 md:hover:bg-surface"
        >
          <span class="flex items-center gap-2">
            <HandIcon :name="r.goal.icon" class="text-indigo" />
            <TypographyH3 as="b" class="min-w-0 flex-1 truncate text-sm group-hover:underline group-hover:underline-offset-[3px]">{{ r.goal.title }}</TypographyH3>
            <Badge size="sm" :variant="r.entry?.done ? 'solid' : 'default'">{{ r.entry?.done ? $t('goal.ticked') : $t('goal.notTicked') }}</Badge>
          </span>
          <TypographyMuted as="span" class="flex items-center gap-1.5 text-[11.5px]">
            {{ $t('day.dayOf', { n: r.day, total: r.goal.totalDays }) }}
            <template v-if="r.entry?.mood">· <GardenIcon :mood="r.entry.mood" class="size-[18px] text-indigo" />{{ $t(`moods.${r.entry.mood}`) }}</template>
          </TypographyMuted>
          <TypographySmall v-if="r.text" as="span" class="leading-relaxed text-indigo">{{ r.text }}</TypographySmall>
          <TypographyMuted v-else as="span" class="italic">{{ $t('day.noJournal') }}</TypographyMuted>
        </NuxtLink>
      </section>
      <div v-else class="flex flex-col items-center gap-3 py-8 text-center">
        <Mochi pose="sleepy" :size="84" />
        <TypographyMuted>{{ $t('day.empty') }}</TypographyMuted>
      </div>

      <TypographyMuted class="mt-6 text-center text-[11px]">
        <span class="md:hidden">{{ $t('day.hintSwipe') }}</span>
        <span class="hidden md:inline">{{ $t('day.hintKeys') }}</span>
      </TypographyMuted>
    </div>
  </div>
</template>
