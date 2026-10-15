<script setup lang="ts">
/** The user's chosen app logo: a garden icon on a rounded accent square. */
const props = withDefaults(defineProps<{ icon?: string, size?: number }>(), { size: 44 })
const { settings } = useSettings()
const id = computed(() => props.icon ?? settings.value.logo)
</script>

<template>
  <span
    class="inline-grid shrink-0 place-items-center bg-primary text-primary-foreground"
    :style="{ width: `${size}px`, height: `${size}px`, borderRadius: `${size * 0.26}px` }"
  >
    <GardenIcon :icon="id" class="size-[72%]" />
  </span>
</template>
