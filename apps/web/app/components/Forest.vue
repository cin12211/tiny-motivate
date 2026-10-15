<script setup lang="ts">
import type { Goal } from '#shared/types'
import { addDays, toISODate } from '#shared/utils/dates'

/**
 * Forest on the home screen: one cell per calendar day since the earliest
 * goal started. A plant grows on every day at least one goal was ticked.
 * Web shows 120 days; the mobile home shows a compact 30-day garden.
 */
const props = withDefaults(defineProps<{ goals: Goal[], days?: number }>(), { days: 120 })
const N = computed(() => props.days)
const small = computed(() => props.days <= 31)
const today = toISODate()

const start = computed(() => props.goals.reduce((m, g) => (g.startDate < m ? g.startDate : m), today))

const cells = computed(() =>
  Array.from({ length: N.value }, (_, i) => {
    const iso = addDays(start.value, i)
    const done = props.goals.filter((g) => {
      const k = Math.round((new Date(iso).getTime() - new Date(g.startDate).getTime()) / 86_400_000) + 1
      return k >= 1 && k <= g.totalDays && g.days[String(k)]?.done
    }).length
    const isToday = iso === today
    const future = iso > today
    const label = dotShort(iso)
    return {
      n: i + 1,
      iso,
      done,
      isToday,
      future,
      firstOfMonth: iso.endsWith('-01'),
      label,
      tip: `${isToday ? 'hôm nay · ' : ''}${label} · ${done ? `${done} mục tiêu xong` : future ? 'chưa tới' : 'chưa mọc cây'}`,
    }
  }),
)
const grown = computed(() => cells.value.filter(c => c.done).length)
const dayIndex = computed(() => cells.value.findIndex(c => c.isToday) + 1)
</script>

<template>
  <section class="flex flex-col items-center" :class="small ? 'gap-3 pb-[22px]' : 'gap-[18px] pt-2 pb-[34px]'">
    <Badge v-if="small">khu vườn {{ N }} ngày</Badge>
    <div v-else class="flex flex-col items-center gap-1.5">
      <Badge variant="solid">{{ weekdayLong(today) }} · {{ dotDate(today) }}</Badge>
      <TypographyMuted as="small" class="text-[11.5px]">ngày <em>{{ dayIndex }}</em> / {{ N }}</TypographyMuted>
    </div>

    <div class="grid w-full grid-cols-10 gap-y-1" :class="!small && 'sm:grid-cols-15'">
      <span
        v-for="c in cells"
        :key="c.n"
        class="forest-cell group relative h-0 rounded-[7px] pt-[100%] text-indigo transition-colors hover:z-[3] hover:bg-surface"
        :class="c.isToday && 'is-today bg-primary text-primary-foreground shadow-[0_0_0_3px_var(--m-paper),0_0_0_4.5px_var(--m-indigo)] hover:bg-primary'"
        :data-tip="small ? undefined : c.tip"
      >
        <!-- padding-box square + absolute centre: aspect-ratio grid items size unreliably in iOS WebKit -->
        <span class="absolute inset-0 grid place-items-center">
          <GardenIcon v-if="c.done" :day="c.n" class="size-[92%] transition-transform duration-200 group-hover:-translate-y-px group-hover:scale-[1.18]" />
          <i
            v-else
            class="block rounded-full transition-transform group-hover:scale-[1.6]"
            :class="c.isToday ? 'size-[7px] bg-primary-foreground' : ['size-[3px] bg-indigo', c.future ? 'opacity-30' : 'opacity-60']"
          />
        </span>
        <b v-if="!small && c.firstOfMonth && !c.done && !c.isToday" class="absolute -top-0.5 left-1/2 -translate-x-1/2 text-[9px] font-medium whitespace-nowrap text-muted-foreground">{{ c.label }}</b>
      </span>
    </div>

    <TypographyMuted class="flex w-full justify-between gap-3" :class="small ? 'text-[11px]' : 'text-[11.5px]'">
      <span :class="!small && 'hidden sm:inline'">{{ dotShort(start) }}</span>
      <span class="text-center">đã mọc <em>{{ grown }}</em> cây<template v-if="!small"> · mỗi cây là một ngày bạn hoàn thành ít nhất một mục tiêu</template></span>
      <span :class="!small && 'hidden sm:inline'">{{ dotShort(addDays(start, N - 1)) }}</span>
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
</style>
