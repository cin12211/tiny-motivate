<script setup lang="ts">
useHead({ title: 'Nhật ký · Motivation' })
const { goals } = useGoals()

const entries = computed(() =>
  goals.value.flatMap(g =>
    Object.entries(g.days)
      .filter(([, d]) => d.journal)
      .map(([n, d]) => ({ goal: g, day: Number(n), date: dayDate(g, Number(n)), ...d })),
  ).sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt)),
)
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="flex items-center gap-3">
      <Mochi pose="neutral" :size="84" />
      <div>
        <h2 class="text-[28px] leading-tight">Nhật ký</h2>
        <p class="text-muted-foreground">Mỗi ngày một chút, nhìn lại thấy mình đi xa ghê.</p>
      </div>
    </div>

    <div class="mt-5 flex flex-col gap-3">
      <NuxtLink v-for="e in entries" :key="`${e.goal.id}-${e.day}`" :to="`/goals/${e.goal.id}`" class="chunky block p-4 hover:bg-field">
        <div class="mb-1.5 flex items-center gap-2 text-xs">
          <Icon :name="`hugeicons:${e.goal.icon}`" class="size-4 text-sky" />
          <span class="truncate font-black">{{ e.goal.title }}</span>
          <span class="text-muted-foreground">· Ngày {{ e.day }} · {{ shortDate(e.date) }}</span>
          <Icon v-if="e.done" name="hugeicons:checkmark-circle-02" class="ml-auto size-5 text-green" />
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="journal-prose min-h-0 p-0 text-sm" v-html="e.journal" />
      </NuxtLink>
      <div v-if="!entries.length" class="chunky flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
        <Mochi pose="sleepy" :size="100" />
        Chưa có dòng nhật ký nào.
      </div>
    </div>
  </div>
</template>
