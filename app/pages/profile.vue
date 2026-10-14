<script setup lang="ts">
useHead({ title: 'Hồ sơ · Motivation' })
const { goals } = useGoals()
const stats = computed(() => overallStats(goals.value))
const totalDone = computed(() => goals.value.reduce((n, g) => n + goalStats(g).doneCount, 0))
const dark = useState('dark', () => false)
function toggleDark() {
  dark.value = !dark.value
  document.documentElement.classList.toggle('dark', dark.value)
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <Card class="items-center px-6 text-center">
      <Mochi pose="happy" :size="130" float />
      <h2 class="text-[28px]">Bạn và Mochi</h2>
      <div class="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
        <StatPill icon="fire" :value="stats.bestStreak" label="Chuỗi dài nhất" />
        <StatPill icon="checkmark-circle-02" :value="totalDone" label="Ngày hoàn thành" tone="sky" />
        <StatPill icon="gift" :value="stats.rewardsUnlocked" label="Quà đã mở" tone="yellow" />
        <StatPill icon="target-02" :value="goals.length" label="Mục tiêu" tone="red" />
      </div>
      <Button variant="outline" class="w-full" @click="toggleDark">
        <Icon :name="dark ? 'hugeicons:sun-03' : 'hugeicons:moon-02'" />
        {{ dark ? 'Giao diện sáng' : 'Giao diện tối' }}
      </Button>
    </Card>
  </div>
</template>
