<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

/** Handwritten accent (Caveat), e.g. the Mochi signature and splash tagline. */
const props = withDefaults(defineProps<{ as?: string, class?: HTMLAttributes['class'] }>(), { as: 'span' })
</script>

<template>
  <component :is="props.as" :class="cn('font-hand text-[24px] leading-none text-indigo', props.class)">
    <slot />
  </component>
</template>
