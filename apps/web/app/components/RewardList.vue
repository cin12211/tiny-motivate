<script setup lang="ts">
import type { Goal } from '#shared/types'

/** Settings-like list of a goal's rewards, unlocked ones filled indigo. */
const props = defineProps<{ goal: Goal }>()
const s = computed(() => goalStats(props.goal))
</script>

<template>
  <section class="flex flex-col items-center gap-1.5 pt-[22px]">
    <Badge class="mb-2">phần quà</Badge>
    <div
      v-for="r in s.rewards"
      :key="r.id"
      class="flex w-full items-center justify-between gap-3 px-0.5 py-2.5"
    >
      <div class="min-w-0">
        <TypographyH3 as="b" class="block">ngày {{ pad2(r.day) }}</TypographyH3>
        <TypographySmall as="span" class="block truncate">{{ r.title }}</TypographySmall>
        <TypographyMuted as="small" class="text-[11.5px]">{{ s.doneCount >= r.day ? (r.openedAt ? 'đã nhận' : 'đã mở khoá') : `còn ${r.day - s.doneCount} ngày` }}</TypographyMuted>
      </div>
      <span
        class="grid h-[52px] w-16 shrink-0 place-items-center overflow-hidden rounded-lg border shadow-[0_6px_14px_-10px_var(--m-glow)]"
        :class="s.doneCount >= r.day ? 'border-indigo bg-primary text-primary-foreground' : 'border-line bg-surface text-muted-foreground'"
      >
        <RewardBadge :reward="r" icon-class="size-6" />
      </span>
    </div>
    <TypographyMuted v-if="!s.rewards.length">Mục tiêu này chưa có phần quà nào.</TypographyMuted>
  </section>
</template>
