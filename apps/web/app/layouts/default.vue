<script setup lang="ts">
/**
 * Mini layout: one centred column on every screen size.
 * md+ gets the sticky top bar (Mochi + wordmark + date chip);
 * phones get the floating bottom switch (all goals / today) instead;
 * the longest streak lives at the top of the mobile home.
 */
import { toISODate } from '#shared/utils/dates'

const route = useRoute()
const { goals, ensureLoaded } = useGoals()
await ensureLoaded()

const stats = computed(() => overallStats(goals.value))
const today = toISODate()

// "Today" opens the first goal still waiting for a tick (or the first goal).
const todayGoal = computed(() => stats.value.pending[0] ?? goals.value[0])
const showSwitch = computed(() => !route.path.startsWith('/goals/new') && route.path !== '/settings')
const onHome = computed(() => route.path === '/')
</script>

<template>
  <div class="min-h-dvh bg-background">
    <header class="sticky top-0 z-20 hidden items-center justify-between gap-4 bg-background px-6 py-3 dashed-bottom md:flex">
      <NuxtLink to="/" class="flex items-center gap-2" :aria-label="$t('common.home')">
        <Mochi :size="34" />
        <TypographyH4 as="span" class="text-sm font-semibold tracking-[.02em] text-indigo">motivation</TypographyH4>
      </NuxtLink>
      <Badge variant="solid" class="shadow-none">{{ dotDate(today) }}</Badge>
    </header>

    <main class="mx-auto w-full max-w-[680px] px-[22px] pt-[max(env(safe-area-inset-top),0px)] pb-[150px] md:px-6 md:pb-16">
      <slot />
    </main>

    <nav
      v-if="showSwitch"
      class="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2.5 bg-gradient-to-t from-background from-60% to-transparent pt-[30px] pb-[calc(20px+env(safe-area-inset-bottom))] md:hidden"
      :aria-label="$t('common.nav')"
    >
      <div class="pointer-events-auto flex gap-1 rounded-[10px] border border-line bg-surface p-1 shadow-[0_8px_20px_-12px_var(--m-glow)]">
        <NuxtLink
          to="/"
          class="grid h-[42px] w-[46px] place-items-center rounded-[7px] text-indigo"
          :class="onHome && 'bg-primary text-primary-foreground'"
          :aria-label="$t('common.allGoals')"
        >
          <GardenIcon forest class="size-[30px]" />
        </NuxtLink>
        <NuxtLink
          :to="todayGoal ? `/goals/${todayGoal.id}` : '/goals/new'"
          class="grid h-[42px] w-[46px] place-items-center rounded-[7px] text-indigo"
          :class="!onHome && 'bg-primary text-primary-foreground'"
          :aria-label="$t('common.today')"
        >
          <GardenIcon :day="2" class="size-[30px]" />
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
