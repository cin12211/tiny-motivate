<script setup lang="ts">
import type { Goal } from '#shared/types'

/**
 * Horizontally scrollable calendar of round day nodes.
 * green = done, blue = today, grey = future, dashed = missed,
 * gold chest = reward day (shows the reward photo/icon).
 */
const props = defineProps<{ goal: Goal }>()
const selected = defineModel<number>({ required: true })

const scroller = ref<HTMLElement>()
const doneCount = computed(() => goalStats(props.goal).doneCount)

const days = computed(() =>
  Array.from({ length: props.goal.totalDays }, (_, i) => {
    const n = i + 1
    const iso = dayDate(props.goal, n)
    return {
      n,
      status: dayStatus(props.goal, n),
      dow: weekdayShort(iso),
      date: shortDate(iso),
      reward: props.goal.rewards.find(r => r.day === n),
    }
  }),
)

function scrollToSelected(behavior: ScrollBehavior = 'smooth') {
  const el = scroller.value?.querySelector<HTMLElement>(`[data-day="${selected.value}"]`)
  el?.scrollIntoView({ behavior, inline: 'center', block: 'nearest' })
}

function scrollBy(dir: number) {
  scroller.value?.scrollBy({ left: dir * 280, behavior: 'smooth' })
}

onMounted(() => nextTick(() => scrollToSelected('instant')))
watch(selected, () => scrollToSelected())
</script>

<template>
  <div class="chunky relative">
    <div ref="scroller" class="scrollbar-none flex snap-x snap-proximity gap-1 overflow-x-auto px-3 pt-3 pb-2" role="listbox" aria-label="Các ngày">
      <button
        v-for="d in days"
        :key="d.n"
        :data-day="d.n"
        role="option"
        :aria-selected="selected === d.n"
        :aria-label="`Ngày ${d.n}, ${d.date}`"
        class="relative flex w-[66px] shrink-0 snap-center flex-col items-center gap-1 pt-0.5 pb-1 outline-none"
        @click="selected = d.n"
      >
        <span class="text-[11px] font-extrabold uppercase" :class="d.status === 'today' ? 'text-sky' : 'text-muted-foreground'">{{ d.dow }}</span>
        <span
          class="mb-1 grid size-[54px] place-items-center rounded-full text-xl font-black tabular-nums transition-[outline] select-none"
          :class="[
            {
              done: 'bg-green text-white shadow-[0_5px_0_var(--m-green-dark)]',
              today: 'bg-sky text-white shadow-[0_5px_0_var(--m-sky-dark),0_0_0_6px_var(--m-sky-soft)]',
              missed: 'border-[3px] border-dashed border-line-dark bg-surface text-muted-foreground',
              future: 'bg-line text-muted-foreground shadow-[0_5px_0_var(--m-line-dark)]',
            }[d.status],
            selected === d.n && 'outline-3 outline-offset-[5px] outline-yellow',
          ]"
        >
          <Icon v-if="d.status === 'done'" name="hugeicons:tick-02" class="size-7" />
          <template v-else>{{ d.n }}</template>
        </span>
        <span class="text-[10.5px] font-bold text-muted-foreground tabular-nums">{{ d.date }}</span>

        <span
          v-if="d.reward"
          class="absolute top-[16px] right-0 z-10 grid size-7 place-items-center overflow-hidden rounded-full border-2 text-orange"
          :class="[
            doneCount >= d.reward.day ? 'border-yellow bg-yellow-soft text-yellow-dark' : 'border-line bg-surface',
            d.status === 'future' && 'animate-bob',
          ]"
          :title="d.reward.title"
        >
          <RewardBadge :reward="d.reward" icon-class="size-4" />
        </span>
      </button>
    </div>

    <button class="absolute top-1/2 -left-4 hidden size-9 -translate-y-1/2 place-items-center rounded-full border-2 border-b-4 border-line bg-surface text-muted-foreground md:grid" aria-label="Ngày trước" @click="scrollBy(-1)">
      <Icon name="hugeicons:arrow-left-01" class="size-5" />
    </button>
    <button class="absolute top-1/2 -right-4 hidden size-9 -translate-y-1/2 place-items-center rounded-full border-2 border-b-4 border-line bg-surface text-muted-foreground md:grid" aria-label="Ngày sau" @click="scrollBy(1)">
      <Icon name="hugeicons:arrow-right-01" class="size-5" />
    </button>
  </div>
  <div class="mt-2.5 flex flex-wrap gap-3.5 px-1 text-xs text-muted-foreground">
    <span class="inline-flex items-center gap-1.5"><i class="inline-block size-2.5 rounded-full bg-green" />Hoàn thành</span>
    <span class="inline-flex items-center gap-1.5"><i class="inline-block size-2.5 rounded-full bg-sky" />Hôm nay</span>
    <span class="inline-flex items-center gap-1.5"><i class="inline-block size-2.5 rounded-full border-2 border-dashed border-line-dark" />Lỡ ngày</span>
    <span class="inline-flex items-center gap-1.5"><i class="inline-block size-2.5 rounded-full bg-line-dark" />Sắp tới</span>
    <span class="inline-flex items-center gap-1.5"><Icon name="hugeicons:gift" class="size-3.5 text-orange" />Ngày nhận quà</span>
  </div>
</template>
