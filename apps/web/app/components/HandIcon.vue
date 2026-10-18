<script setup lang="ts">
import { HAND_ICONS, HAND_VIEWBOX } from "@motivation/garden";

/**
 * Hand-drawn UI icon (Mini design). `name` uses the old Hugeicons names,
 * e.g. "gift", "settings-01". One fixed size (size-5) everywhere, so call sites never set a size; the `iconify` class lets
 * Badge shrink it. Drawn from the shared sprite (utils/icon-sprite.ts).
 */
const props = defineProps<{ name: string }>();
const href = computed(() => iconHref(`h-${props.name}`, HAND_VIEWBOX, HAND_ICONS[props.name]));
</script>

<template>
  <svg
    :viewBox="HAND_VIEWBOX"
    aria-hidden="true"
    class="iconify inline-block size-5 shrink-0 overflow-visible"
  >
    <use v-if="href" :href="href" />
  </svg>
</template>
