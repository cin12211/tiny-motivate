<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

/** Secondary / helper text (Typography muted). */
const props = withDefaults(defineProps<{ as?: string, class?: HTMLAttributes['class'] }>(), { as: 'p' })
</script>

<template>
  <component :is="props.as" :class="cn('text-[12px] leading-snug text-muted-foreground', props.class)">
    <slot />
  </component>
</template>
