<script setup lang="ts">
import type { Goal } from '#shared/types'

/** Goal row on home: icon + title + tick chip, a dot per day, and the next reward. */
const props = defineProps<{ goal: Goal }>()
const s = computed(() => goalStats(props.goal))

const dots = computed(() =>
  Array.from({ length: props.goal.totalDays }, (_, i) => {
    const n = i + 1
    return { n, done: !!props.goal.days[String(n)]?.done, today: n === s.value.today, reward: !!rewardAt(props.goal, n) }
  }),
)
</script>

<template>
  <NuxtLink
    :to="`/goals/${goal.id}`"
    class="group block w-full rounded-[10px] px-1 pt-4 pb-[18px] text-left text-ink transition-colors dashed-top md:px-3.5 md:hover:bg-surface"
  >
    <div class="mb-3 flex items-center gap-2">
      <Icon :name="`hugeicons:${goal.icon}`" class="size-[18px] text-indigo" />
      <TypographyH3 as="b" class="min-w-0 flex-1 truncate text-sm group-hover:underline group-hover:underline-offset-[3px]">{{ goal.title }}</TypographyH3>
      <Badge v-if="s.active" size="sm" :variant="s.todayDone ? 'solid' : 'default'">{{ s.todayDone ? 'đã tick' : 'chưa tick' }}</Badge>
      <Badge v-else-if="s.finished" size="sm" variant="outline">xong</Badge>
    </div>

    <div class="grid grid-cols-15 place-items-center gap-y-[9px]" aria-hidden="true">
      <i
        v-for="d in dots"
        :key="d.n"
        class="block"
        :class="[
          d.reward
            ? ['size-[9px] rotate-45 rounded-[2px] border-[1.5px] border-indigo', d.done && 'bg-indigo']
            : d.done
              ? 'size-2 rounded-full bg-indigo'
              : d.today
                ? 'size-[9px] rounded-full border-[1.5px] border-indigo'
                : 'size-[3px] rounded-full bg-indigo opacity-55',
        ]"
      />
    </div>

    <TypographyMuted class="mt-3">
      {{ pad2(s.doneCount) }}/{{ goal.totalDays }} ngày ·
      <template v-if="s.nextReward">còn {{ s.daysToNext }} ngày tới {{ s.nextReward.title }}</template>
      <template v-else>đã mở hết quà</template>
    </TypographyMuted>
  </NuxtLink>
</template>
