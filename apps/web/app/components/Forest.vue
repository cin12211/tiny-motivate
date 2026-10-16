<script setup lang="ts">
import { onClickOutside, onKeyStroke } from '@vueuse/core'
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

// Plants are numbered from the earliest goal start, as before.
const firstStart = computed(() => props.goals.reduce((m, g) => (g.startDate < m ? g.startDate : m), today))

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
      plant: Math.max(1, dayNumberOf(firstStart.value, iso)),
      done,
      isToday,
      future,
      viewed: iso === viewed.value && !isToday,
      monthLabel: i > 0 && iso.endsWith('-01') ? label : '',
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

/* ---------- date chip + popover ---------- */
const open = ref(false)
const anchor = ref<HTMLElement>()
const calMonth = ref(today.slice(0, 7)) // yyyy-mm shown in the calendar
onClickOutside(anchor, () => (open.value = false))
onKeyStroke('Escape', () => (open.value = false))

function toggle() {
  open.value = !open.value
  calMonth.value = viewed.value.slice(0, 7)
}
function shiftMonth(n: number) {
  const [y, m] = calMonth.value.split('-').map(Number)
  calMonth.value = toISODate(new Date(y!, m! - 1 + n, 1)).slice(0, 7)
}
function pick(iso: string) {
  viewed.value = iso
  open.value = false
}

const chipLabel = computed(() =>
  `${viewed.value === today ? t('common.today') : t(`weekdays.${weekdayIndex(viewed.value)}`)} · ${dotDate(viewed.value)}`)

const calTitle = computed(() => {
  const d = parseISODate(`${calMonth.value}-01`)
  const s = d.toLocaleDateString(locale.value === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
})
const calDays = computed(() => {
  const first = parseISODate(`${calMonth.value}-01`)
  const lead = (first.getDay() + 6) % 7 // Monday first
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  return {
    lead,
    days: Array.from({ length: count }, (_, i) => {
      const iso = addDays(`${calMonth.value}-01`, i)
      return { iso, n: i + 1, isToday: iso === today, on: iso === viewed.value }
    }),
  }
})
</script>

<template>
  <section class="flex flex-col items-center" :class="web ? 'gap-3 pt-1 pb-5' : 'gap-2 pb-3.5'">
    <!-- viewed date + popover -->
    <div ref="anchor" class="relative z-[15] flex justify-center">
      <Badge
        as="button"
        type="button"
        variant="solid"
        class="cursor-pointer gap-1.5"
        :aria-expanded="open"
        aria-haspopup="dialog"
        @click="toggle"
      >
        {{ chipLabel }}
        <i class="size-1.5 border-r-[1.5px] border-b-[1.5px] border-current transition-transform duration-150" :class="open ? 'translate-y-px -rotate-[135deg]' : '-translate-y-0.5 rotate-45'" />
      </Badge>

      <div
        v-if="open"
        class="absolute top-[calc(100%+8px)] left-1/2 flex w-64 -translate-x-1/2 flex-col gap-2 rounded-xl border border-line bg-surface p-3 shadow-[0_14px_30px_-14px_rgba(0,0,0,.35)] animate-in fade-in-0 zoom-in-95"
        role="dialog"
        :aria-label="$t('forest.pickDate')"
      >
        <div class="flex items-center justify-between text-[12.5px] text-indigo">
          <Button type="button" variant="ghost" size="icon-sm" :aria-label="$t('forest.prevMonth')" @click="shiftMonth(-1)"><HandIcon name="arrow-left-01" /></Button>
          <b class="font-semibold">{{ calTitle }}</b>
          <Button type="button" variant="ghost" size="icon-sm" :aria-label="$t('forest.nextMonth')" @click="shiftMonth(1)"><HandIcon name="arrow-left-01" class="-scale-x-100" /></Button>
        </div>
        <div class="grid grid-cols-7 gap-0.5 text-center">
          <span v-for="i in 7" :key="i" class="text-[9.5px] text-muted-foreground">{{ $t(`forest.weekdaysShort.${i - 1}`) }}</span>
        </div>
        <div class="grid grid-cols-7 gap-0.5 text-center">
          <span v-for="i in calDays.lead" :key="`l${i}`" />
          <button
            v-for="d in calDays.days"
            :key="d.iso"
            type="button"
            class="h-7 rounded-[7px] text-[11.5px] text-ink hover:bg-background"
            :class="[d.isToday && 'font-semibold text-indigo shadow-[inset_0_0_0_1px_var(--m-indigo)]', d.on && 'bg-primary text-primary-foreground hover:bg-primary']"
            :aria-label="dotDate(d.iso)"
            :aria-pressed="d.on"
            @click="pick(d.iso)"
          >
            {{ d.n }}
          </button>
        </div>
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
        <Button type="button" variant="link" size="xs" class="self-center text-[11px]" @click="pick(today)">{{ $t('forest.backToday') }}</Button>
      </div>
    </div>

    <!-- one continuous grid -->
    <div class="grid w-full" :class="[gridClass, web && 'gap-y-1']">
      <span
        v-for="c in cells"
        :key="c.iso"
        class="forest-cell group relative h-0 rounded-[7px] pt-[100%] text-indigo transition-colors hover:z-[3] hover:bg-surface"
        :class="[
          web && (dense ? 'min-[861px]:size-[22px] min-[861px]:justify-self-center min-[861px]:pt-0' : 'min-[861px]:size-[30px] min-[861px]:justify-self-center min-[861px]:pt-0'),
          c.viewed && 'shadow-[inset_0_0_0_1.5px_var(--m-indigo)]',
          c.isToday && ['is-today bg-primary text-primary-foreground hover:bg-primary', dense ? 'shadow-[0_0_0_2px_var(--m-paper),0_0_0_3.5px_var(--m-indigo)]' : 'shadow-[0_0_0_3px_var(--m-paper),0_0_0_4.5px_var(--m-indigo)]'],
          dense && 'is-dense',
        ]"
        :data-tip="web ? c.tip : undefined"
      >
        <!-- padding-box square + absolute centre: aspect-ratio grid items size unreliably in iOS WebKit -->
        <span class="absolute inset-0 grid place-items-center">
          <GardenIcon v-if="c.done" :day="c.plant" :class="web ? 'size-[92%]' : 'size-[88%]'" class="transition-transform duration-200 group-hover:-translate-y-px group-hover:scale-[1.18]" />
          <i
            v-else
            class="block rounded-full transition-transform group-hover:scale-[1.6]"
            :class="c.isToday ? 'size-[7px] bg-primary-foreground' : ['size-[3px] bg-indigo', c.future ? 'opacity-30' : 'opacity-60']"
          />
        </span>
        <b v-if="web && c.monthLabel && !c.done && !c.isToday" class="absolute -top-0.5 left-1/2 -translate-x-1/2 text-[9px] font-medium whitespace-nowrap text-muted-foreground">{{ c.monthLabel }}</b>
      </span>
    </div>

    <TypographyMuted class="flex w-full justify-between gap-3" :class="web ? 'text-[11.5px]' : 'text-[11px]'">
      <span>{{ dotShort(range.from) }}</span>
      <span class="text-center"><i18n-t keypath="forest.grown" tag="span" scope="global"><template #n><em>{{ grown }}</em></template></i18n-t><template v-if="web"> · {{ $t('forest.grownNote') }}</template></span>
      <span>{{ dotShort(range.to) }}</span>
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
