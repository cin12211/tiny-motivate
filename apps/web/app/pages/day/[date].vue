<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { addDays, dayNumberOf, toISODate } from '#shared/utils/dates'

/**
 * One day across all goals (opened from a garden cell on home): what grew,
 * which goals were done, mood and the start of each journal. The scrollable
 * day strip, the date chip calendar, swipe (mobile) and ← → keys (web) move
 * between days; future days are off limits.
 */
const route = useRoute()
const { t } = useI18n()
const { goals } = useGoals()
const today = toISODate()

const date = computed(() => {
  const d = String(route.params.date || '')
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && d <= today ? d : today
})
useHead({ title: () => `${dotDate(date.value)} · Tiny Motivate` })

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

/* ---------- day strip: min(earliest goal start, today − 45) … today ---------- */
const strip = ref<HTMLElement>()
const stripDays = computed(() => {
  const earliest = goals.value.reduce((m, g) => (g.startDate < m ? g.startDate : m), today)
  const from = [earliest, addDays(today, -45)].sort()[0]!
  return Array.from({ length: dayNumberOf(from, today) }, (_, i) => {
    const iso = addDays(from, i)
    return { iso, grew: doneOn(iso), label: iso === today ? t('common.today') : dotShort(iso) }
  })
})
function centerActive(behavior: ScrollBehavior) {
  // offsetLeft is measured from the strip itself (it is position: relative)
  const el = strip.value?.querySelector<HTMLElement>('[aria-current="date"]')
  if (!strip.value || !el) return
  strip.value.scrollTo({ left: el.offsetLeft - strip.value.clientWidth / 2 + el.clientWidth / 2, behavior })
}
onMounted(() => nextTick(() => centerActive('instant')))
watch(date, () => nextTick(() => centerActive('smooth')))

// plants come from the garden (kept apart from goals)
const { plantMap } = useGarden()
const iconFor = (iso: string) => plantMap.value.get(iso) ?? ''

function doneOn(iso: string) {
  return plantMap.value.has(iso)
}

/* ---------- change day: keys (web) + swipe (mobile) ---------- */
onKeyStroke(['ArrowLeft', 'ArrowRight'], (e) => {
  const el = e.target as HTMLElement | null
  if (el?.closest('input, textarea, [contenteditable="true"]')) return
  shift(e.key === 'ArrowLeft' ? -1 : 1)
})
let startX = 0
let startY = 0
let fromStrip = false
function onTouchStart(e: TouchEvent) {
  // swipes that start on the day strip just scroll the strip
  fromStrip = !!strip.value?.contains(e.target as Node)
  startX = e.touches[0]!.clientX
  startY = e.touches[0]!.clientY
}
function onTouchEnd(e: TouchEvent) {
  if (fromStrip) return
  const dx = e.changedTouches[0]!.clientX - startX
  const dy = e.changedTouches[0]!.clientY - startY
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) shift(dx < 0 ? 1 : -1)
}
</script>

<template>
  <div class="min-h-[70dvh]" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
    <!-- top bar: back · date chip -->
    <div class="app-header sticky top-0 z-10 -mx-[22px] flex items-center justify-between bg-gradient-to-b from-background from-75% to-transparent px-[22px] pt-3.5 pb-2.5 md:-mx-7 md:px-7 max-[860px]:md:-mx-4 max-[860px]:md:px-4">
      <Button as-child variant="ghost" size="icon" class="app-header-btn text-indigo md:w-auto md:gap-1.5 md:pr-2.5 md:pl-1.5 md:text-[12.5px]" :aria-label="$t('common.back')">
        <NuxtLink to="/"><HandIcon name="arrow-left-01" /><span class="hidden md:inline">{{ $t('common.allGoals') }}</span></NuxtLink>
      </Button>
      <CalendarChip v-model="picked" :label="chipLabel" :max="today" :marked="doneOn">
        <TypographyMuted as="small" class="pt-2 text-[10.5px] dashed-top">• {{ $t('day.legend') }}</TypographyMuted>
      </CalendarChip>
      <span class="app-header-btn w-9 md:w-[120px]" />
    </div>

    <!-- day strip: the active day is big and centred; the edges fade out under
         two static gradients (a mask on the scrolling strip repaints every frame) -->
    <div class="relative -mx-[22px] md:-mx-7">
    <div
      ref="strip"
      class="scrollbar-none relative flex snap-x snap-proximity items-center gap-1 overflow-x-auto px-[50%] pt-2 pb-1"
      role="listbox"
      :aria-label="$t('day.pick')"
    >
      <button
        v-for="d in stripDays"
        :key="d.iso"
        type="button"
        role="option"
        class="flex shrink-0 snap-center flex-col items-center gap-1"
        :class="d.iso === date ? 'w-[108px]' : 'w-[46px] opacity-55 md:hover:opacity-90'"
        :aria-current="d.iso === date ? 'date' : undefined"
        :aria-selected="d.iso === date"
        :aria-label="dotDate(d.iso)"
        @click="go(d.iso)"
      >
        <!-- the icon is always drawn at 96px and scaled down (transform, no layout work per frame) -->
        <span class="relative grid w-full place-items-center text-indigo" :class="d.iso === date ? 'h-24' : 'h-[34px]'">
          <GardenIcon
            v-if="d.grew"
            :icon="iconFor(d.iso)"
            class="absolute top-1/2 left-1/2 -mt-12 -ml-12 size-24 transition-transform duration-200 motion-reduce:transition-none"
            :class="d.iso === date ? 'scale-100' : 'scale-[0.354]'"
          />
          <i v-else class="block rounded-full bg-indigo opacity-40" :class="d.iso === date ? 'size-2' : 'size-1'" />
        </span>
        <small class="text-[9.5px] leading-none whitespace-nowrap" :class="d.iso === date ? 'font-semibold text-indigo' : 'text-muted-foreground'">{{ d.label }}</small>
      </button>
    </div>
    <i class="pointer-events-none absolute inset-y-0 left-0 w-[18%] bg-gradient-to-r from-background to-background/0" />
    <i class="pointer-events-none absolute inset-y-0 right-0 w-[18%] bg-gradient-to-l from-background to-background/0" />
    </div>

    <div class="mx-auto max-w-[560px]">
      <div class="flex flex-col items-center pt-3 pb-5 text-center">
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
        <Germi pose="sleepy" :size="84" />
        <TypographyMuted>{{ $t('day.empty') }}</TypographyMuted>
      </div>

      <TypographyMuted class="mt-6 text-center text-[11px]">
        {{ $t('day.hint') }}
      </TypographyMuted>
    </div>
  </div>
</template>
