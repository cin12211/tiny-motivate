<script setup lang="ts">
/**
 * Mochi — the Motivation mascot, Mini style: a single-line ant drawn with
 * currentColor (so it follows the indigo accent and dark mode).
 */
export type MochiPose = 'idle' | 'wave' | 'cheer' | 'gift' | 'sleepy' | 'sprout'

const props = withDefaults(defineProps<{ pose?: MochiPose, size?: number | string }>(), {
  pose: 'idle',
  size: 76,
})

const { t } = useI18n()
const label = computed(() => t(`mochi.${props.pose}`))
</script>

<template>
  <svg
    class="shrink-0 text-indigo"
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    stroke-width="2.4"
    stroke-linecap="round"
    stroke-linejoin="round"
    role="img"
    :aria-label="label"
  >
    <!-- antennae + heart tips -->
    <path d="M43 31q-4-12-10-17M57 31q4-12 10-17" />
    <path d="M33 14c-2-3-7-1-5 3l5 4 5-4c2-4-3-6-5-3zM67 14c-2-3-7-1-5 3l5 4 5-4c2-4-3-6-5-3z" stroke-width="1.8" />
    <!-- abdomen + body -->
    <path d="M80 62a11 11 0 1 1-2 18" />
    <ellipse cx="50" cy="58" rx="29" ry="25" />
    <!-- eyes -->
    <path v-if="pose === 'sleepy'" d="M36 55q4 3 8 0M56 55q4 3 8 0" />
    <path v-else-if="pose === 'cheer'" d="M36 56q4-5 8 0M56 56q4-5 8 0" />
    <g v-else fill="currentColor" stroke="none">
      <circle cx="40" cy="54" r="2.6" />
      <circle cx="60" cy="54" r="2.6" />
    </g>
    <!-- mouth + blush -->
    <path d="M45 63q2.5 3 5 0q2.5 3 5 0" />
    <path d="M29 62l4-2M31 66l4-2M65 60l4 2M67 64l4 2" stroke-width="1.4" />
    <!-- legs -->
    <path d="M38 82l-2 7M50 83v7M62 82l2 7" />
    <!-- pose extras -->
    <template v-if="pose === 'wave'">
      <path d="M77 54q9-4 11-15" />
      <path d="M85 36l3 3" />
    </template>
    <path v-else-if="pose === 'cheer'" d="M24 52q-9-6-10-16M76 52q9-6 10-16" />
    <template v-else-if="pose === 'gift'">
      <rect x="40" y="70" width="20" height="14" rx="2" />
      <path d="M50 70v14M40 76h20" />
    </template>
    <template v-else-if="pose === 'sprout'">
      <!-- holds a small two-leaf sprout on its left side -->
      <path d="M23 60q-7 1-10-5" />
      <path d="M12 56q1.5-8-.5-17" />
      <path d="M12 48c3-4 8-5 11.5-3c-2 4-7.5 5.5-11.5 3z" stroke-width="1.8" />
      <path d="M11.6 42c-1-5-5-8-10-7c1 5 5 7.5 10 7z" stroke-width="1.8" />
    </template>
    <path v-if="pose === 'sleepy'" d="M74 30h6l-6 6h6" stroke-width="1.8" />
  </svg>
</template>
