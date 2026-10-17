<script setup lang="ts">
/**
 * The user's chosen app logo: a garden icon in the accent colour on a white
 * tile (dark surface in dark mode), matching the iOS home-screen icon.
 */
const props = withDefaults(defineProps<{ icon?: string, size?: number }>(), { size: 44 })
const { settings } = useSettings()
const id = computed(() => props.icon ?? settings.value.logo)
</script>

<template>
  <span
    class="inline-grid shrink-0 place-items-center bg-[var(--m-tile)] text-indigo shadow-[0_0_0_1px_var(--m-line),0_8px_18px_-12px_var(--m-glow)]"
    :style="{ width: `${size}px`, height: `${size}px`, borderRadius: `${size * 0.26}px` }"
  >
    <GardenIcon :icon="id" class="size-[90%]" />
  </span>
</template>
