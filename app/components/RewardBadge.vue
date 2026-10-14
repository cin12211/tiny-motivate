<script setup lang="ts">
import type { Reward } from '#shared/types'

/** A reward's photo if it has one, otherwise its Hugeicons icon. */
defineProps<{ reward: Pick<Reward, 'icon' | 'image' | 'title'>, iconClass?: string }>()
</script>

<template>
  <img v-if="reward.image" :src="reward.image" :alt="reward.title" class="size-full object-cover">
  <Icon v-else :name="`hugeicons:${reward.icon || 'gift'}`" :class="iconClass" />
</template>
