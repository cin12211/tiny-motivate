<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

/** Body paragraph (Typography p). */
const props = withDefaults(defineProps<{ as?: string, class?: HTMLAttributes['class'] }>(), { as: 'p' })
</script>

<template>
  <component :is="props.as" :class="cn('text-[13.5px] leading-[1.6] text-ink', props.class)">
    <slot />
  </component>
</template>
