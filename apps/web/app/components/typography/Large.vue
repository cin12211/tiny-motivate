<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

/** Big emphasised text, e.g. the splash wordmark (Typography large). */
const props = withDefaults(defineProps<{ as?: string, class?: HTMLAttributes['class'] }>(), { as: 'div' })
</script>

<template>
  <component :is="props.as" :class="cn('text-[22px] font-semibold tracking-[.06em] text-indigo', props.class)">
    <slot />
  </component>
</template>
