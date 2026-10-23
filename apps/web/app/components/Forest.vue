<script setup lang="ts">
import { useEventListener, useLocalStorage, useResizeObserver } from '@vueuse/core'
import { gardenIcons } from '@motivation/garden'
import type { Goal } from '#shared/types'
import { addDays, dayNumberOf, parseISODate, toISODate } from '#shared/utils/dates'

/**
 * Garden on the home screen: one cell per calendar day, a plant on every day
 * at least one goal was ticked.
 *
 * The range is a fixed block of the calendar year containing the viewed date:
 * the year is split into N-month blocks from January (N = 2 → [1,2] [3,4] …
 * [11,12]), so it never spills into another year. The solid chip above shows
 * the viewed date and opens a popover with a month calendar, the number of
 * months to show and "back to today".
 * Mobile: 1 / 2 / 3 / 6 months (default 3). Web: 3 / 6 / 12 (default 6).
 * The choice is saved on the device (localStorage, also in the app).
 */
const { t, locale } = useI18n()
const props = defineProps<{ goals: Goal[], web?: boolean }>()

const today = toISODate()
const OPTIONS = computed(() => (props.web ? [3, 6, 12] : [1, 2, 3, 6]))
// remembered on this device (separately for the phone and web layouts), so
// leaving home or reopening the app keeps the user's choice (v60b)
const DEFAULT_MONTHS = props.web ? 6 : 3
const savedMonths = useLocalStorage(props.web ? 'motivation-garden-months-web' : 'motivation-garden-months', DEFAULT_MONTHS)
const months = computed({
  get: () => (OPTIONS.value.includes(Number(savedMonths.value)) ? Number(savedMonths.value) : DEFAULT_MONTHS),
  set: (n: number) => { savedMonths.value = n },
})
const viewed = ref(today)

/* ---------- range ---------- */
const range = computed(() => {
  const d = parseISODate(viewed.value)
  const startMonth = Math.floor(d.getMonth() / months.value) * months.value
  const from = toISODate(new Date(d.getFullYear(), startMonth, 1))
  const to = toISODate(new Date(d.getFullYear(), startMonth + months.value, 0))
  return { from, to, days: dayNumberOf(from, to) }
})

const doneDatesMap = computed(() => goalsDoneDateMap(props.goals))
/** first 15 ticked dates grow p1..p15, later dates a seeded pick */
const iconFor = computed(() => gardenIcons(doneDatesMap.value.keys()))

const cells = computed(() => {
  const doneMap = doneDatesMap.value
  const { from, days } = range.value
  const viewedVal = viewed.value
  return Array.from({ length: days }, (_, i) => {
    const iso = addDays(from, i)
    const done = doneMap.get(iso) || 0
    const isToday = iso === today
    const future = iso > today
    const label = dotShort(iso)
    return {
      iso,
      // first 15 ticked dates: p1..p15; later: random from the pool, seeded by the date (same on the day page)
      grow: iconFor.value(iso),
      done,
      isToday,
      future,
      viewed: iso === viewedVal && !isToday,
      // web: dd.mm on the first and last cell and on each month start
      monthLabel: i === 0 || i === days - 1 || iso.endsWith('-01') ? label : '',
      tip: `${isToday ? `${t('common.today')} · ` : ''}${label} · ${done ? t('forest.tipDone', { n: done }) : future ? t('forest.tipFuture') : t('forest.tipEmpty')}`,
    }
  })
})
const grown = computed(() => cells.value.filter(c => c.done).length)

const dense = computed(() => (props.web ? months.value === 12 : months.value === 6))
/** Mobile 6 months: 20px cells, so smaller dots (v61e). */
const tinyDots = computed(() => !props.web && dense.value)
/** Mobile 1 month: a week per row, 7 big cells filling the width (v64f). */
const week = computed(() => !props.web && months.value === 1)

/**
 * Square cells, as many per row as fit the width, centred (v49f). Every second
 * row (odd 0-based row) shifts right by a quarter cell so the garden looks
 * planted rather than gridded; the grid keeps that quarter cell as right
 * padding. Uses `left` (not a transform) to keep the hover scale / tooltip
 * transforms intact. The column count is measured from the grid width, so the
 * stagger always matches the real rows (recomputed on resize / months change).
 *   mobile: 28px cells (20px for 6 months), no gaps; 1 month: 7 columns
 *   filling the width (cell = width / 7.25, the quarter cell is the stagger)
 *   web: 30px cells, 2px column gap (24px / 1px for 12 months)
 */
const grid = ref<HTMLElement>()
// content width = grid width minus the quarter-cell right padding
const gridWidth = ref(0)
const fullWidth = ref(0)
function measure() {
  const el = grid.value
  if (!el) return
  fullWidth.value = el.clientWidth
  gridWidth.value = el.clientWidth - Number.parseFloat(getComputedStyle(el).paddingRight || '0')
}
useResizeObserver(grid, measure)
// the web / mobile copies swap visibility at the md breakpoint: re-measure on window resize too
useEventListener('resize', measure)
onMounted(() => nextTick(measure))
const layout = computed(() => {
  if (week.value && fullWidth.value > 0) return { cell: Math.floor((fullWidth.value / 7.25) * 10) / 10, gap: 0, cols: 7 }
  const { cell, gap } = props.web
    ? (dense.value ? { cell: 24, gap: 1 } : { cell: 30, gap: 2 })
    : (dense.value ? { cell: 20, gap: 0 } : { cell: 28, gap: 0 })
  const fit = Math.floor((gridWidth.value + gap) / (cell + gap))
  return { cell, gap, cols: fit > 0 ? fit : 10 }
})
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${layout.value.cols}, ${layout.value.cell}px)`,
  columnGap: `${layout.value.gap}px`,
  paddingRight: `${layout.value.cell / 4}px`,
}))
const cellStyle = (i: number) => ({
  width: `${layout.value.cell}px`,
  height: `${layout.value.cell}px`,
  ...(Math.floor(i / layout.value.cols) % 2 === 1 && { left: `${layout.value.cell / 4}px` }),
})

const chipLabel = computed(() =>
  `${viewed.value === today ? t('common.today') : t(`weekdays.${weekdayIndex(viewed.value)}`)} · ${dotDate(viewed.value)}`)

/** Any goal ticked on this date (calendar dots). */
function doneOn(iso: string) {
  return (doneDatesMap.value.get(iso) || 0) > 0
}

/** Today and past cells open the day page. */
function openDay(iso: string) {
  if (iso <= today) navigateTo(`/day/${iso}`)
}
</script>

<template>
  <section class="flex flex-col items-center" :class="web ? 'gap-3 pt-1 pb-5' : 'gap-2 pb-3.5'">
    <!-- viewed date + calendar (and how many months to show) -->
    <CalendarChip v-model="viewed" :label="chipLabel" :marked="doneOn">
      <div class="flex flex-col gap-1.5 pt-2 dashed-top">
        <TypographyMuted as="small" class="text-[10.5px]">{{ $t('forest.show') }}</TypographyMuted>
        <div class="grid gap-[3px] rounded-lg bg-background p-[3px]" :class="OPTIONS.length === 4 ? 'grid-cols-4' : 'grid-cols-3'" role="radiogroup" :aria-label="$t('forest.monthsAria')">
          <button
            v-for="n in OPTIONS"
            :key="n"
            type="button"
            role="radio"
            :aria-checked="months === n"
            class="h-[26px] rounded-md px-0.5 text-[10.5px] whitespace-nowrap text-indigo"
            :class="months === n && 'bg-primary text-primary-foreground'"
            @click="months = n"
          >
            {{ $t('forest.months', { n }) }}
          </button>
        </div>
      </div>
    </CalendarChip>

    <!-- one continuous grid -->
    <div ref="grid" class="grid w-full justify-center gap-y-0" :style="gridStyle">
      <span
        v-for="(c, i) in cells"
        :key="c.iso"
        class="forest-cell group relative rounded-[7px] text-indigo transition-colors hover:z-[3] hover:bg-surface"
        :style="cellStyle(i)"
        :class="[
          !c.future && 'cursor-pointer',
          c.viewed && 'shadow-[inset_0_0_0_1.5px_var(--m-indigo)]',
          c.isToday && 'is-today shadow-[inset_0_0_0_1.5px_var(--m-indigo)]',
          dense && 'is-dense',
        ]"
        :data-tip="web ? c.tip : undefined"
        :role="c.future ? undefined : 'button'"
        :tabindex="c.future ? undefined : 0"
        :aria-label="c.future ? undefined : c.tip"
        @click="openDay(c.iso)"
        @keydown.enter="openDay(c.iso)"
      >
        <span class="absolute inset-0 grid place-items-center">
          <GardenIcon v-if="c.done" :icon="c.grow" :class="web ? 'size-[96%]' : 'size-full'" class="transition-transform duration-200 group-hover:-translate-y-px group-hover:scale-[1.18]" />
          <i
            v-else
            class="block rounded-full transition-transform group-hover:scale-[1.6]"
            :class="c.isToday ? ['bg-indigo', tinyDots ? 'size-[3.5px]' : week ? 'size-2' : 'size-[7px]'] : ['bg-indigo', tinyDots ? 'size-[2px]' : week ? 'size-[5px]' : 'size-[3px]', c.future ? 'opacity-30' : 'opacity-60']"
          />
        </span>
        <b v-if="web && c.monthLabel && !c.done" class="absolute -top-0.5 left-1/2 -translate-x-1/2 text-[9px] font-medium whitespace-nowrap text-muted-foreground">{{ c.monthLabel }}</b>
      </span>
    </div>

    <TypographyMuted class="flex w-full justify-between gap-3" :class="web ? 'text-[11.5px]' : 'text-[11px]'">
      <span v-if="!web">{{ dotShort(range.from) }}</span>
      <span class="text-center" :class="web && 'w-full'"><i18n-t keypath="forest.grown" tag="span" scope="global"><template #n><em>{{ grown }}</em></template></i18n-t><template v-if="web"> · {{ $t('forest.grownNote') }}</template></span>
      <span v-if="!web">{{ dotShort(range.to) }}</span>
    </TypographyMuted>
  </section>
</template>

<style scoped>
.forest-cell[data-tip]::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translate(-50%, 4px);
  padding: 5px 8px;
  border-radius: 6px;
  background: var(--m-indigo);
  color: var(--m-on-indigo);
  font-size: 10.5px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s, transform 0.15s;
}
.forest-cell[data-tip]:hover::after {
  opacity: 1;
  transform: translate(-50%, 0);
}
.forest-cell.is-today::before {
  content: "";
  position: absolute;
  inset: -5px;
  border-radius: 10px;
  border: 1.5px solid var(--m-indigo);
  /* a few pulses to point at today, then still (an endless animation keeps the GPU busy) */
  animation: pulse-ring 1.8s ease-out 3 forwards;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .forest-cell.is-today::before { animation: none; opacity: 0; }
}
.forest-cell.is-today.is-dense::before {
  inset: -3px;
  border-radius: 8px;
}
</style>
