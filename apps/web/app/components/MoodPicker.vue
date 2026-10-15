<script setup lang="ts">
import { MOODS } from '@motivation/garden'
import type { MoodId } from '#shared/types'

/** "How did today feel?" — five mood flowers. Tap again to clear. */
const mood = defineModel<MoodId | null | undefined>()
</script>

<template>
  <div class="mt-3.5 flex flex-col gap-2 pt-3.5 dashed-top" role="group" aria-label="Hôm nay bạn thấy thế nào">
    <TypographyMuted as="small">hôm nay thấy thế nào?</TypographyMuted>
    <div class="grid grid-cols-5 gap-1">
      <button
        v-for="m in MOODS"
        :key="m.id"
        type="button"
        class="flex flex-col items-center gap-0.5 rounded-lg px-0 pt-1.5 pb-[5px] text-indigo transition-[opacity,background-color] duration-150 hover:opacity-75"
        :class="mood === m.id ? 'bg-surface opacity-100 shadow-[inset_0_0_0_1px_var(--m-indigo)] hover:opacity-100' : 'opacity-40'"
        :aria-label="m.label"
        :aria-pressed="mood === m.id"
        @click="mood = mood === m.id ? null : m.id"
      >
        <GardenIcon :mood="m.id" class="size-9" />
        <TypographySmall as="span" class="text-[10.5px] whitespace-nowrap text-indigo">{{ m.label }}</TypographySmall>
      </button>
    </div>
  </div>
</template>
