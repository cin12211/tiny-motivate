<script setup lang="ts">
import type { Goal } from '#shared/types'

/** Settings-like list of a goal's rewards, unlocked ones filled indigo. */
const props = defineProps<{ goal: Goal }>()
const s = computed(() => goalStats(props.goal))
</script>

<template>
  <section class="flex flex-col items-center gap-1.5 pt-[22px] md:gap-2 md:pt-3">
    <Badge class="mb-2">{{ $t('goal.rewards') }}</Badge>
    <div
      v-for="r in s.rewards"
      :key="r.id"
      class="flex w-full items-center justify-between gap-3 px-0.5 py-2.5 md:py-2"
    >
      <div class="min-w-0">
        <TypographyH3 as="b" class="block">{{ $t('goal.rewardDay', { n: pad2(r.day) }) }}</TypographyH3>
        <TypographySmall as="span" class="block truncate">{{ r.title }}</TypographySmall>
        <TypographyMuted as="small" class="text-[11.5px]">{{ s.doneCount >= r.day ? (r.openedAt ? $t('goal.received') : $t('goal.unlocked')) : $t('goal.daysLeft', { n: r.day - s.doneCount }) }}</TypographyMuted>
      </div>
      <span
        class="grid h-[52px] w-16 shrink-0 place-items-center overflow-hidden rounded-lg border shadow-[0_6px_14px_-10px_var(--m-glow)]"
        :class="s.doneCount >= r.day ? 'border-indigo bg-primary text-primary-foreground' : 'border-line bg-surface text-muted-foreground'"
      >
        <RewardBadge :reward="r" />
      </span>
    </div>
    <TypographyMuted v-if="!s.rewards.length">{{ $t('goal.noRewards') }}</TypographyMuted>
  </section>
</template>
