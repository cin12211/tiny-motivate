<script setup lang="ts">
import type { Reward } from '#shared/types'

/** A reward's photo if it has one, otherwise its Hugeicons icon. */
defineProps<{ reward: Pick<Reward, 'icon' | 'image' | 'title'>, iconClass?: string, imgClass?: string }>()
</script>

<template>
  <img v-if="reward.image" :src="assetUrl(reward.image)" :alt="reward.title" class="object-cover" :class="imgClass ?? 'size-full'">
  <HandIcon v-else :name="reward.icon || 'gift'" :class="iconClass" />
</template>
