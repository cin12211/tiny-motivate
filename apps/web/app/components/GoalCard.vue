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
    class="goal-card group block w-full px-1 pt-4 pb-[18px] text-left text-ink transition-colors dashed-bottom [&:not(:has(~.goal-card))]:border-b-0 md:px-3.5 md:pt-3 md:pb-[13px] md:hover:rounded-[10px] md:hover:border-b-transparent md:hover:bg-surface md:[&:has(+.goal-card:hover)]:border-b-transparent"
  >
    <div class="mb-3 flex items-center gap-2">
      <HandIcon :name="goal.icon" class="text-indigo" />
      <TypographyH3 as="b" class="min-w-0 flex-1 truncate text-sm group-hover:underline group-hover:underline-offset-[3px]">{{ goal.title }}</TypographyH3>
      <Badge v-if="s.active" size="sm" :variant="s.todayDone ? 'solid' : 'default'">{{ s.todayDone ? $t('goal.ticked') : $t('goal.notTicked') }}</Badge>
      <Badge v-else-if="s.finished" size="sm" variant="outline">{{ $t('goal.finished') }}</Badge>
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
      {{ $t('goal.progress', { done: pad2(s.doneCount), total: goal.totalDays }) }} ·
      <template v-if="s.nextReward">{{ $t('goal.toNext', { n: s.daysToNext, reward: s.nextReward.title }) }}</template>
      <template v-else>{{ $t('goal.allOpened') }}</template>
    </TypographyMuted>
  </NuxtLink>
</template>
