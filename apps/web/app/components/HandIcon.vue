<script setup lang="ts">
import { HAND_ICONS, HAND_VIEWBOX } from "@motivation/garden";

/**
 * Hand-drawn UI icon (Mini design). `name` uses the old Hugeicons names,
 * e.g. "gift", "settings-01". One fixed size (size-5) everywhere, so call sites never set a size; the `iconify` class lets
 * Badge shrink it.
 */
defineProps<{ name: string }>();
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <svg
    :viewBox="HAND_VIEWBOX"
    aria-hidden="true"
    class="iconify inline-block size-5 shrink-0 overflow-visible"
    v-html="HAND_ICONS[name] ?? ''"
  />
</template>
