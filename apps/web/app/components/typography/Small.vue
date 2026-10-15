<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

/** Small text (Typography small). */
const props = withDefaults(defineProps<{ as?: string, class?: HTMLAttributes['class'] }>(), { as: 'small' })
</script>

<template>
  <component :is="props.as" :class="cn('text-[12px] leading-snug text-ink', props.class)">
    <slot />
  </component>
</template>
