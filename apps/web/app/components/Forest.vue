<script setup lang="ts">
import { growIconForDate } from '@motivation/garden'
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
 * Mobile: 1 / 2 / 3 / 6 months (default 2). Web: 3 / 6 / 12 (default 6).
 */
const { t, locale } = useI18n()
const props = defineProps<{ goals: Goal[], web?: boolean }>()

const today = toISODate()
const OPTIONS = computed(() => (props.web ? [3, 6, 12] : [1, 2, 3, 6]))
const months = ref(props.web ? 6 : 2)
const viewed = ref(today)

/* ---------- range ---------- */
const range = computed(() => {
  const d = parseISODate(viewed.value)
  const startMonth = Math.floor(d.getMonth() / months.value) * months.value
  const from = toISODate(new Date(d.getFullYear(), startMonth, 1))
  const to = toISODate(new Date(d.getFullYear(), startMonth + months.value, 0))
  return { from, to, days: dayNumberOf(from, to) }
})

const cells = computed(() =>
  Array.from({ length: range.value.days }, (_, i) => {
    const iso = addDays(range.value.from, i)
    const done = props.goals.filter((g) => {
      const k = dayNumberOf(g.startDate, iso)
      return k >= 1 && k <= g.totalDays && g.days[String(k)]?.done
    }).length
    const isToday = iso === today
    const future = iso > today
    const label = dotShort(iso)
    return {
      iso,
      // random from the 95-icon pool, seeded by the date (same on the day page)
      grow: growIconForDate(iso),
      done,
      isToday,
      future,
      viewed: iso === viewed.value && !isToday,
      // web: dd.mm on the first and last cell and on each month start
      monthLabel: i === 0 || i === range.value.days - 1 || iso.endsWith('-01') ? label : '',
      tip: `${isToday ? `${t('common.today')} · ` : ''}${label} · ${done ? t('forest.tipDone', { n: done }) : future ? t('forest.tipFuture') : t('forest.tipEmpty')}`,
    }
  }),
)
const grown = computed(() => cells.value.filter(c => c.done).length)

/** Grid density: more columns (smaller cells) for long ranges. */
const gridClass = computed(() => props.web
  ? months.value === 12 ? 'grid-cols-15 min-[861px]:grid-cols-30' : 'grid-cols-10 min-[861px]:grid-cols-20'
  : months.value === 6 ? 'grid-cols-15' : 'grid-cols-10')
const dense = computed(() => (props.web ? months.value === 12 : months.value === 6))

const chipLabel = computed(() =>
  `${viewed.value === today ? t('common.today') : t(`weekdays.${weekdayIndex(viewed.value)}`)} · ${dotDate(viewed.value)}`)

/** Any goal ticked on this date (calendar dots). */
function doneOn(iso: string) {
  return props.goals.some((g) => {
    const k = dayNumberOf(g.startDate, iso)
    return k >= 1 && k <= g.totalDays && !!g.days[String(k)]?.done
  })
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
    <div class="grid w-full" :class="[gridClass, web && 'gap-y-1']">
      <span
        v-for="c in cells"
        :key="c.iso"
        class="forest-cell group relative h-0 rounded-[7px] pt-[100%] text-indigo transition-colors hover:z-[3] hover:bg-surface"
        :class="[
          web && (dense ? 'min-[861px]:size-[22px] min-[861px]:justify-self-center min-[861px]:pt-0' : 'min-[861px]:size-[30px] min-[861px]:justify-self-center min-[861px]:pt-0'),
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
        <!-- padding-box square + absolute centre: aspect-ratio grid items size unreliably in iOS WebKit -->
        <span class="absolute inset-0 grid place-items-center">
          <GardenIcon v-if="c.done" :icon="c.grow" :class="web ? 'size-[92%]' : 'size-[88%]'" class="transition-transform duration-200 group-hover:-translate-y-px group-hover:scale-[1.18]" />
          <i
            v-else
            class="block rounded-full transition-transform group-hover:scale-[1.6]"
            :class="c.isToday ? 'size-[7px] bg-indigo' : ['size-[3px] bg-indigo', c.future ? 'opacity-30' : 'opacity-60']"
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
  animation: pulse-ring 1.8s ease-out infinite;
  pointer-events: none;
}
.forest-cell.is-today.is-dense::before {
  inset: -3px;
  border-radius: 8px;
}
</style>
