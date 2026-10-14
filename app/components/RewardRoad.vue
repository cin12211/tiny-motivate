<script setup lang="ts">
import type { Goal, Reward } from '#shared/types'

const props = defineProps<{ goal: Goal }>()
const emit = defineEmits<{ open: [reward: Reward] }>()
const doneCount = computed(() => goalStats(props.goal).doneCount)
</script>

<template>
  <div class="flex flex-col gap-3">
    <p v-if="!goal.rewards.length" class="text-sm text-muted-foreground">Mục tiêu này chưa có phần thưởng nào.</p>
    <div v-for="r in goal.rewards" :key="r.id" class="flex items-center gap-3">
      <div
        class="relative grid size-11 shrink-0 place-items-center rounded-xl border-2 border-b-4 text-[22px]"
        :class="doneCount >= r.day ? 'border-yellow bg-yellow-soft text-yellow-dark' : 'border-line bg-surface text-orange'"
      >
        <span class="grid size-full place-items-center overflow-hidden rounded-[10px]">
          <RewardBadge :reward="r" icon-class="size-[22px]" />
        </span>
        <span v-if="doneCount >= r.day" class="absolute -right-1.5 -bottom-1.5 grid size-[18px] place-items-center rounded-full bg-green text-white">
          <Icon name="hugeicons:tick-02" class="size-3" />
        </span>
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-2">
          <span class="truncate text-sm font-bold">{{ r.title }}</span>
          <span class="shrink-0 text-xs text-muted-foreground">Ngày {{ r.day }}</span>
        </div>
        <Progress :model-value="Math.min(100, (doneCount / r.day) * 100)" class="mt-1.5 h-3" :class="doneCount >= r.day && '[&>[data-slot=progress-indicator]]:bg-green'" />
      </div>
      <Button
        v-if="doneCount >= r.day && !r.openedAt"
        size="xs"
        variant="gold"
        @click="emit('open', r)"
      >
        Mở quà
      </Button>
    </div>
  </div>
</template>
