<script setup lang="ts">
/**
 * Web (lg+): left sidebar with brand, menu, new-goal button and stats.
 * Mobile: top stats bar (streak / rewards / goals) + bottom tab bar.
 */
const { goals, ensureLoaded } = useGoals()
await ensureLoaded()
const stats = computed(() => overallStats(goals.value))
const route = useRoute()

const nav = [
  { to: '/', label: 'Mục tiêu', icon: 'target-02' },
  { to: '/rewards', label: 'Phần thưởng', icon: 'gift' },
  { to: '/journal', label: 'Nhật ký', icon: 'book-open-01' },
  { to: '/profile', label: 'Hồ sơ', icon: 'user-circle' },
]
function isActive(to: string) {
  return to === '/' ? route.path === '/' || route.path.startsWith('/goals') : route.path.startsWith(to)
}
</script>

<template>
  <div class="min-h-dvh lg:grid lg:grid-cols-[280px_1fr]">
    <!-- Web sidebar -->
    <aside class="sticky top-0 hidden h-dvh flex-col gap-5 overflow-y-auto border-r-2 border-line px-4 pt-5 pb-6 lg:flex">
      <NuxtLink to="/" class="flex items-center gap-2 px-2">
        <Mochi :size="44" />
        <span class="text-[28px] font-black tracking-tight text-green">motivation</span>
      </NuxtLink>

      <nav class="flex flex-col gap-1.5">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex h-12 items-center gap-3.5 rounded-xl border-2 border-transparent px-3.5 text-sm font-black tracking-wider text-muted-foreground uppercase transition-colors hover:bg-field"
          :class="isActive(item.to) && 'border-sky bg-sky-soft text-sky hover:bg-sky-soft'"
        >
          <Icon :name="`hugeicons:${item.icon}`" class="size-7" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <Button as-child size="lg">
        <NuxtLink to="/goals/new"><Icon name="hugeicons:add-01" /> Mục tiêu mới</NuxtLink>
      </Button>

      <div class="mt-auto grid grid-cols-3 gap-1.5">
        <StatPill icon="fire" :value="stats.bestStreak" label="Chuỗi" />
        <StatPill icon="gift" :value="stats.rewardsUnlocked" label="Quà" tone="yellow" />
        <StatPill icon="target-02" :value="stats.active" label="Mục tiêu" tone="red" />
      </div>
    </aside>

    <div class="flex min-w-0 flex-col">
      <!-- Mobile top stats -->
      <header class="sticky top-0 z-20 flex items-center justify-between border-b-2 border-line bg-background/95 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2.5 backdrop-blur lg:hidden">
        <NuxtLink to="/" class="grid h-8 w-10 place-items-center rounded-lg border-2 border-line text-sky" aria-label="Mục tiêu">
          <Icon name="hugeicons:target-02" class="size-5" />
        </NuxtLink>
        <span class="flex items-center gap-1 text-base font-black text-orange"><Icon name="hugeicons:fire" class="size-6" />{{ stats.bestStreak }}</span>
        <span class="flex items-center gap-1 text-base font-black text-yellow-dark"><Icon name="hugeicons:gift" class="size-6" />{{ stats.rewardsUnlocked }}</span>
        <span class="flex items-center gap-1 text-base font-black text-red"><Icon name="hugeicons:task-done-01" class="size-6" />{{ stats.todayLeft }}</span>
      </header>

      <main class="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-28 lg:px-8 lg:pt-7 lg:pb-12">
        <slot />
      </main>

      <!-- Mobile tab bar -->
      <nav class="fixed inset-x-0 bottom-0 z-20 flex h-[calc(70px+env(safe-area-inset-bottom))] items-center justify-around border-t-2 border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Điều hướng">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          :aria-label="item.label"
          class="grid h-12 w-14 place-items-center rounded-xl border-2 border-transparent text-muted-foreground"
          :class="isActive(item.to) && 'border-sky bg-sky-soft text-sky'"
        >
          <Icon :name="`hugeicons:${item.icon}`" class="size-7" />
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>
