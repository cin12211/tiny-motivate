<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

/** Quote (Typography blockquote). */
const props = withDefaults(defineProps<{ as?: string, class?: HTMLAttributes['class'] }>(), { as: 'blockquote' })
</script>

<template>
  <component :is="props.as" :class="cn('border-l-2 border-indigo pl-3 text-[13px] text-ink italic', props.class)">
    <slot />
  </component>
</template>
