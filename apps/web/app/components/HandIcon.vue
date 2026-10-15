<script setup lang="ts">
import { HAND_ICONS, HAND_VIEWBOX } from '@motivation/garden'

/**
 * Hand-drawn UI icon (Mini design). `name` uses the old Hugeicons names,
 * e.g. "gift", "settings-01". Sized 1em by default; the `iconify` class keeps
 * the size rules of Button and friends working.
 */
defineProps<{ name: string }>()
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <svg :viewBox="HAND_VIEWBOX" aria-hidden="true" class="iconify inline-block size-[1em] shrink-0" v-html="HAND_ICONS[name] ?? ''" />
</template>
