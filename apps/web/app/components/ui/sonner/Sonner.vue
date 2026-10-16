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
      <HandIcon name="checkmark-circle-02" />
    </template>
    <template #info-icon>
      <HandIcon name="information-circle" />
    </template>
    <template #warning-icon>
      <HandIcon name="alert-02" />
    </template>
    <template #error-icon>
      <HandIcon name="cancel-circle" />
    </template>
    <template #loading-icon>
      <div>
        <HandIcon name="loading-03" class="animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <HandIcon name="cancel-01" />
    </template>
  </Sonner>
</template>
