<script setup lang="ts">
useHead({ title: 'Mục tiêu · Motivation' })

const { goals } = useGoals()
const stats = computed(() => overallStats(goals.value))

const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 11 ? 'Chào buổi sáng' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
})

const mochiLine = computed(() => {
  if (!goals.value.length) return 'Tạo mục tiêu đầu tiên và tự đặt phần thưởng cho mình nhé!'
  if (stats.value.todayLeft === 0) return 'Hôm nay bạn đã xong hết rồi. Mochi tự hào về bạn!'
  return `Còn ${stats.value.todayLeft} mục tiêu chờ bạn tick hôm nay. Cố lên!`
})
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="flex items-center gap-3">
      <Mochi pose="waving" :size="84" class="shrink-0" />
      <div class="min-w-0 flex-1">
        <small class="text-muted-foreground">{{ greeting }}</small>
        <h2 class="text-[28px] leading-tight">Mục tiêu của bạn</h2>
      </div>
    </div>
    <div class="chunky mt-3 mb-1 px-3.5 py-2.5 text-sm font-bold">{{ mochiLine }}</div>

    <div class="my-4 flex gap-2 lg:hidden">
      <StatPill icon="fire" :value="stats.bestStreak" label="Chuỗi ngày" />
      <StatPill icon="target-02" :value="stats.active" label="Đang chạy" tone="red" />
      <StatPill icon="gift" :value="stats.rewardsUnlocked" label="Quà đã mở" tone="yellow" />
    </div>

    <div class="mt-5 mb-2.5 flex items-baseline justify-between">
      <h3 class="text-[19px]">Đang thực hiện</h3>
      <span class="text-[13px] text-muted-foreground">{{ goals.length }} mục tiêu</span>
    </div>

    <div v-if="goals.length" class="flex flex-col gap-3">
      <GoalCard v-for="g in goals" :key="g.id" :goal="g" />
    </div>
    <div v-else class="chunky flex flex-col items-center gap-3 px-6 py-10 text-center">
      <Mochi pose="sleepy" :size="120" />
      <p class="text-muted-foreground">Chưa có mục tiêu nào. Mochi đang ngủ chờ bạn đó.</p>
    </div>

    <Button as-child size="lg" class="mt-6 w-full lg:hidden">
      <NuxtLink to="/goals/new"><Icon name="hugeicons:add-01" /> Mục tiêu mới</NuxtLink>
    </Button>
  </div>
</template>
