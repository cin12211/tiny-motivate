<script setup lang="ts">
import { FOREST, VIEWBOX, moodById, plantForDay } from '@motivation/garden'

/**
 * One icon from the Mochi garden set (packages/garden):
 * pass `day` for that day's plant, `mood` for a mood flower, or `forest`
 * for the forest icon.
 */
const props = defineProps<{ day?: number, mood?: string | null, forest?: boolean }>()

const body = computed(() => {
  if (props.forest) return FOREST.body
  if (props.mood) return moodById(props.mood)?.body ?? ''
  return plantForDay(props.day ?? 1).body
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <svg :viewBox="VIEWBOX" aria-hidden="true" class="shrink-0" v-html="body" />
</template>
