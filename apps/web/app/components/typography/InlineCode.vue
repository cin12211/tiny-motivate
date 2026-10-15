<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

/** Inline code (Typography inline code). */
const props = withDefaults(defineProps<{ as?: string, class?: HTMLAttributes['class'] }>(), { as: 'code' })
</script>

<template>
  <component :is="props.as" :class="cn('rounded-[5px] bg-surface px-1.5 py-0.5 text-[12px] text-indigo', props.class)">
    <slot />
  </component>
</template>
