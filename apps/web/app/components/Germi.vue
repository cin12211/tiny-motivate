<script setup lang="ts">
import { GERMI_BOLD_STROKE, MASCOT_POSES, MASCOT_VIEWBOX, type MascotPose } from '@motivation/garden'

/**
 * Germi — the Tiny Motivate mascot ("germ" = sprout) (packages/garden/src/mascot.ts), hand-drawn
 * with currentColor so it follows the accent and dark mode. The gift pose
 * fills its box with `--gm-fill` (defaults to the page background); set it on
 * a parent when the mascot sits on another colour.
 */
export type GermiPose = MascotPose

/** Every Germi is drawn with one thick 3.4 line for all strokes (v59c / v59e). */
const props = withDefaults(defineProps<{ pose?: GermiPose, size?: number | string }>(), {
  pose: 'idle',
  size: 76,
})

const { t } = useI18n()
const label = computed(() => t(`germi.${props.pose}`))
const body = computed(() => {
  const pose = MASCOT_POSES[props.pose]
  return pose.replace(/stroke-width="[\d.]+"/g, `stroke-width="${GERMI_BOLD_STROKE}"`)
})
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
    :stroke-width="GERMI_BOLD_STROKE"
    stroke-linecap="round"
    stroke-linejoin="round"
    role="img"
    :aria-label="label"
    v-html="body"
  />
</template>

<style scoped>
.mascot {
  --gm-fill: var(--gm-bg, var(--background));
}
</style>
