<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

/** Bulleted list (Typography list). */
const props = withDefaults(defineProps<{ as?: string, class?: HTMLAttributes['class'] }>(), { as: 'ul' })
</script>

<template>
  <component :is="props.as" :class="cn('ml-5 list-disc text-[13px] [&>li]:mt-1', props.class)">
    <slot />
  </component>
</template>
