<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

/** Section title (Typography h2). */
const props = withDefaults(defineProps<{ as?: string, class?: HTMLAttributes['class'] }>(), { as: 'h2' })
</script>

<template>
  <component :is="props.as" :class="cn('text-[15px] leading-snug font-medium text-indigo text-balance', props.class)">
    <slot />
  </component>
</template>
