<script setup lang="ts">
import { FOREST, HAND_ICONS, HAND_VIEWBOX, VIEWBOX, iconById, moodById, plantForDay } from '@motivation/garden'

/**
 * One icon from the Mochi garden set (packages/garden):
 * pass `day` for that day's plant, `mood` for a mood flower, `forest` for the
 * forest icon, or `icon` with any id ("forest", "p4", "m2"…, or a garden/farm
 * hand icon like "g-shovel" - those are drawn on their own 24px grid).
 */
const props = defineProps<{ day?: number, mood?: string | null, forest?: boolean, icon?: string }>()

const svg = computed(() => {
  if (props.icon?.startsWith('g-')) return { viewBox: HAND_VIEWBOX, body: HAND_ICONS[props.icon] ?? '' }
  if (props.icon) return { viewBox: VIEWBOX, body: iconById(props.icon)?.body ?? '' }
  if (props.forest) return { viewBox: VIEWBOX, body: FOREST.body }
  if (props.mood) return { viewBox: VIEWBOX, body: moodById(props.mood)?.body ?? '' }
  return { viewBox: VIEWBOX, body: plantForDay(props.day ?? 1).body }
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <svg :viewBox="svg.viewBox" aria-hidden="true" class="shrink-0" v-html="svg.body" />
</template>
