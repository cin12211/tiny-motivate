<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { Toaster as Sonner } from "vue-sonner"
import { cn } from "@/lib/utils"

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--m-indigo)',
      '--normal-text': 'var(--m-on-indigo)',
      '--normal-border': 'var(--m-indigo)',
      '--border-radius': '8px',
    }"
    v-bind="props"
  >
    <template #success-icon>
      <Icon name="hugeicons:checkmark-circle-02" class="size-4" />
    </template>
    <template #info-icon>
      <Icon name="hugeicons:information-circle" class="size-4" />
    </template>
    <template #warning-icon>
      <Icon name="hugeicons:alert-02" class="size-4" />
    </template>
    <template #error-icon>
      <Icon name="hugeicons:cancel-circle" class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Icon name="hugeicons:loading-03" class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <Icon name="hugeicons:cancel-01" class="size-4" />
    </template>
  </Sonner>
</template>
