<script setup lang="ts">
import { MASCOT_POSES, MASCOT_STROKE, MASCOT_VIEWBOX, type MascotPose } from '@motivation/garden'

/**
 * Germi — the Tiny Motivate mascot ("germ" = sprout) (packages/garden/src/mascot.ts), hand-drawn
 * with currentColor so it follows the accent and dark mode. The gift pose
 * fills its box with `--gm-fill` (defaults to the page background); set it on
 * a parent when the mascot sits on another colour.
 */
export type GermiPose = MascotPose

const props = withDefaults(defineProps<{ pose?: GermiPose, size?: number | string }>(), {
  pose: 'idle',
  size: 76,
})

const { t } = useI18n()
const label = computed(() => t(`germi.${props.pose}`))
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <svg
    class="mascot shrink-0 text-indigo"
    :width="size"
    :height="size"
    :viewBox="MASCOT_VIEWBOX"
    fill="none"
    stroke="currentColor"
    :stroke-width="MASCOT_STROKE"
    stroke-linecap="round"
    stroke-linejoin="round"
    role="img"
    :aria-label="label"
    v-html="MASCOT_POSES[pose]"
  />
</template>

<style scoped>
.mascot {
  --gm-fill: var(--gm-bg, var(--background));
}
</style>
