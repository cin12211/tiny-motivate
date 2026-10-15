<script setup lang="ts">
import { FOREST, VIEWBOX, iconById, moodById, plantForDay } from '@motivation/garden'

/**
 * One icon from the Mochi garden set (packages/garden):
 * pass `day` for that day's plant, `mood` for a mood flower, `forest` for the
 * forest icon, or `icon` with any id ("forest", "p4", "m2"…).
 */
const props = defineProps<{ day?: number, mood?: string | null, forest?: boolean, icon?: string }>()

const body = computed(() => {
  if (props.icon) return iconById(props.icon)?.body ?? ''
  if (props.forest) return FOREST.body
  if (props.mood) return moodById(props.mood)?.body ?? ''
  return plantForDay(props.day ?? 1).body
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <svg :viewBox="VIEWBOX" aria-hidden="true" class="shrink-0" v-html="body" />
</template>
