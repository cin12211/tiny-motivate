<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

/** Sub-section / item title (Typography h3). */
const props = withDefaults(defineProps<{ as?: string, class?: HTMLAttributes['class'] }>(), { as: 'h3' })
</script>

<template>
  <component :is="props.as" :class="cn('text-[13.5px] leading-snug font-medium text-indigo', props.class)">
    <slot />
  </component>
</template>
