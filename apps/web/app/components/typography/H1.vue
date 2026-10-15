<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

/** Page title (shadcn-vue Typography h1, Mini style). */
const props = withDefaults(defineProps<{ as?: string, class?: HTMLAttributes['class'] }>(), { as: 'h1' })
</script>

<template>
  <component :is="props.as" :class="cn('text-[20px] leading-tight font-medium text-indigo text-balance', props.class)">
    <slot />
  </component>
</template>
