<script setup lang="ts">
/** Circular progress ring with the goal icon in the middle. */
const props = withDefaults(defineProps<{ percent: number, icon: string, size?: number }>(), { size: 62 })
const r = 26
const c = 2 * Math.PI * r
const dash = computed(() => `${(Math.min(100, props.percent) / 100) * c} ${c}`)
</script>

<template>
  <div class="relative grid shrink-0 place-items-center" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg viewBox="0 0 62 62" class="absolute inset-0 -rotate-90">
      <circle cx="31" cy="31" :r="r" fill="none" stroke="var(--m-line)" stroke-width="6" />
      <circle cx="31" cy="31" :r="r" fill="none" stroke="var(--m-green)" stroke-width="6" stroke-linecap="round" :stroke-dasharray="dash" class="transition-[stroke-dasharray] duration-500" />
    </svg>
    <Icon :name="`hugeicons:${icon}`" class="size-[40%] text-sky" />
  </div>
</template>
