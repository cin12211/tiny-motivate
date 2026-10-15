<script setup lang="ts">
import { VIEWBOX, moodById, plantForDay } from '@motivation/garden'

/**
 * One icon from the Mochi garden set (packages/garden):
 * pass `day` for that day's plant, or `mood` for a mood flower.
 */
const props = defineProps<{ day?: number, mood?: string | null }>()

const body = computed(() => {
  if (props.mood) return moodById(props.mood)?.body ?? ''
  return plantForDay(props.day ?? 1).body
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <svg :viewBox="VIEWBOX" aria-hidden="true" class="shrink-0" v-html="body" />
</template>
