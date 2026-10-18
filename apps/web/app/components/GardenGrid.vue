<script setup lang="ts">
import { growIconForGoal } from '@motivation/garden'
import type { Goal, Reward } from '#shared/types'

/** The goal's garden: one cell per day (10 columns). Tap a cell to open that day. */
const props = defineProps<{ goal: Goal }>()
const selected = defineModel<number>({ required: true })
const s = computed(() => goalStats(props.goal))

const rewardsMap = computed(() => {
  const map = new Map<number, Reward>()
  for (const r of props.goal.rewards) {
    map.set(r.day, r)
  }
  return map
})

const cells = computed(() => {
  const map = rewardsMap.value
  const { id, days, totalDays } = props.goal
  return Array.from({ length: totalDays }, (_, i) => {
    const n = i + 1
    const reward = map.get(n)
    const done = !!days[String(n)]?.done
    return {
      n,
      reward,
      done,
      icon: done ? growIconForGoal(id, n) : undefined,
    }
  })
})
</script>

<template>
  <section class="flex flex-col items-center gap-4 pt-5 pb-2 dashed-top md:gap-3 md:pt-3.5 md:pb-1.5">
    <Badge variant="solid">{{ $t('common.days', { n: goal.totalDays }) }}</Badge>
    <div class="grid w-full max-w-[460px] grid-cols-10 gap-y-1.5 min-[861px]:max-w-none min-[861px]:grid-cols-15 min-[861px]:gap-y-1">
      <button
        v-for="c in cells"
        :key="c.n"
        class="relative h-0 min-w-0 rounded-md pt-[100%] text-indigo transition-colors hover:bg-surface min-[861px]:size-[32px] min-[861px]:justify-self-center min-[861px]:pt-0"
        :class="[
          selected === c.n && 'bg-surface shadow-[inset_0_0_0_1px_var(--m-indigo)]',
          c.reward && s.doneCount < c.n && 'opacity-35',
        ]"
        :aria-label="$t('goal.dayN', { n: c.n })"
        @click="selected = c.n"
      >
        <span class="absolute inset-0 grid place-items-center">
          <span v-if="c.reward" class="grid size-[72%] max-h-6 max-w-6 place-items-center overflow-hidden rounded">
            <RewardBadge :reward="c.reward" icon-class="size-full" />
          </span>
          <GardenIcon v-else-if="c.done" :icon="c.icon!" class="size-[94%] max-h-8 max-w-8" />
          <i
            v-else
            class="block rounded-full"
            :class="c.n === s.today ? 'size-2.5 border-[1.5px] border-indigo' : 'size-[3px] bg-indigo opacity-60'"
          />
        </span>
      </button>
    </div>
  </section>
</template>
