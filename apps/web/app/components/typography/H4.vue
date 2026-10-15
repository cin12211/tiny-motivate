<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

/** Small heading (Typography h4). */
const props = withDefaults(defineProps<{ as?: string, class?: HTMLAttributes['class'] }>(), { as: 'h4' })
</script>

<template>
  <component :is="props.as" :class="cn('text-[13px] leading-snug font-medium text-ink', props.class)">
    <slot />
  </component>
</template>
