<script setup lang="ts">
import type { Goal } from '#shared/types'

const props = defineProps<{ goal: Goal, active?: boolean, compact?: boolean }>()
const s = computed(() => goalStats(props.goal))
</script>

<template>
  <NuxtLink
    :to="`/goals/${goal.id}`"
    class="chunky flex w-full items-center text-left transition-colors hover:bg-field active:translate-y-0.5 active:border-b-2"
    :class="[
      compact ? 'gap-2.5 rounded-xl p-2.5' : 'gap-3.5 p-3.5',
      active && 'border-sky bg-sky-soft hover:bg-sky-soft',
    ]"
  >
    <GoalRing :percent="s.percent" :icon="goal.icon" :size="compact ? 48 : 62" />
    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-2">
        <h4 class="truncate leading-tight" :class="compact ? 'text-[15px]' : 'text-[17px]'">{{ goal.title }}</h4>
        <span
          v-if="!s.finished && s.today >= 1"
          class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black"
          :class="s.todayDone ? 'bg-green-soft text-green-dark' : 'bg-red-soft text-red'"
        >{{ s.todayDone ? 'Đã xong' : 'Chưa làm' }}</span>
        <span v-else-if="s.finished" class="shrink-0 rounded-full bg-yellow-soft px-2 py-0.5 text-[11px] font-black text-yellow-dark">Hoàn tất</span>
      </div>
      <p class="mt-0.5 text-[12.5px] text-muted-foreground">
        Ngày {{ Math.max(0, Math.min(s.today, goal.totalDays)) }}/{{ goal.totalDays }} · {{ s.doneCount }} ngày hoàn thành
      </p>
      <div v-if="s.nextReward" class="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border-2 border-line bg-field py-0.5 pr-2.5 pl-1 text-[12.5px] font-bold">
        <span class="grid size-[22px] shrink-0 place-items-center overflow-hidden rounded-full bg-surface text-orange">
          <RewardBadge :reward="s.nextReward" icon-class="size-3.5" />
        </span>
        <span class="truncate">Còn {{ s.daysToNext }} ngày: {{ s.nextReward.title }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
