<script setup lang="ts">
/**
 * The user's chosen app logo: a garden icon on a rounded tile.
 * Normal: accent tile + light icon. Inverted: light tile + accent icon.
 */
const props = withDefaults(defineProps<{ icon?: string, size?: number, invert?: boolean }>(), { size: 44, invert: undefined })
const { settings } = useSettings()
const id = computed(() => props.icon ?? settings.value.logo)
const inverted = computed(() => props.invert ?? settings.value.logoInvert)
</script>

<template>
  <span
    class="inline-grid shrink-0 place-items-center"
    :class="inverted ? 'border border-line bg-surface text-indigo' : 'bg-primary text-primary-foreground'"
    :style="{ width: `${size}px`, height: `${size}px`, borderRadius: `${size * 0.26}px` }"
  >
    <GardenIcon :icon="id" class="size-[72%]" />
  </span>
</template>
