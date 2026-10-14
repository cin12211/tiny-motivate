<script setup lang="ts">
defineProps<{ icon: string, value: string | number, label: string, tone?: 'orange' | 'yellow' | 'sky' | 'red' }>()
</script>

<template>
  <div class="chunky flex-1 px-2 py-2 text-center">
    <strong class="flex items-center justify-center gap-1 text-[22px] leading-tight font-black tabular-nums">
      <Icon
        :name="`hugeicons:${icon}`"
        class="size-[0.9em]"
        :class="{ orange: 'text-orange', yellow: 'text-yellow-dark', sky: 'text-sky', red: 'text-red' }[tone ?? 'orange']"
      />
      {{ value }}
    </strong>
    <span class="text-xs text-muted-foreground">{{ label }}</span>
  </div>
</template>
