<script setup lang="ts">
import { FOREST, HAND_ICONS, HAND_VIEWBOX, VIEWBOX, iconById, moodById, plantForDay } from '@motivation/garden'

/**
 * One icon from the garden set (packages/garden):
 * pass `day` for that day's plant, `mood` for a mood flower, `forest` for the
 * forest icon, or `icon` with any id ("forest", "p4", "m2"…, or a garden/farm
 * hand icon like "g-shovel" - those are drawn on their own 24px grid).
 */
const props = defineProps<{ day?: number, mood?: string | null, forest?: boolean, icon?: string }>()

const svg = computed(() => {
  if (props.icon?.startsWith('g-')) return { id: `h-${props.icon}`, viewBox: HAND_VIEWBOX, body: HAND_ICONS[props.icon] }
  if (props.icon) return { id: `i-${props.icon}`, viewBox: VIEWBOX, body: iconById(props.icon)?.body }
  if (props.forest) return { id: 'i-forest', viewBox: VIEWBOX, body: FOREST.body }
  if (props.mood) return { id: `i-${props.mood}`, viewBox: VIEWBOX, body: moodById(props.mood)?.body }
  const plant = plantForDay(props.day ?? 1)
  return { id: `i-p${plant.id}`, viewBox: VIEWBOX, body: plant.body }
})
// one shared <symbol> per icon (utils/icon-sprite.ts)
const href = computed(() => iconHref(svg.value.id, svg.value.viewBox, svg.value.body))
</script>

<template>
  <svg :viewBox="svg.viewBox" aria-hidden="true" class="shrink-0">
    <use v-if="href" :href="href" />
  </svg>
</template>
