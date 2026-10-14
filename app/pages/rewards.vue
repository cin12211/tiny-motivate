<script setup lang="ts">
useHead({ title: 'Phần thưởng · Motivation' })
const { goals } = useGoals()

const items = computed(() =>
  goals.value.flatMap((g) => {
    const s = goalStats(g)
    return g.rewards.map(r => ({ goal: g, reward: r, unlocked: s.doneCount >= r.day, left: r.day - s.doneCount }))
  }).sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || a.left - b.left),
)
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <div class="flex items-center gap-3">
      <Mochi pose="gift" :size="84" />
      <div>
        <h2 class="text-[28px] leading-tight">Phần thưởng</h2>
        <p class="text-muted-foreground">Những món quà bạn tự hứa với mình.</p>
      </div>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-2">
      <NuxtLink
        v-for="it in items"
        :key="it.reward.id"
        :to="`/goals/${it.goal.id}`"
        class="chunky flex items-center gap-3 p-3 hover:bg-field"
        :class="it.unlocked && 'border-yellow bg-yellow-soft hover:bg-yellow-soft'"
      >
        <span class="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-b-4 border-line bg-surface text-orange" :class="!it.unlocked && 'grayscale-[.6]'">
          <RewardBadge :reward="it.reward" icon-class="size-7" />
        </span>
        <div class="min-w-0 flex-1">
          <b class="block truncate font-black">{{ it.reward.title }}</b>
          <small class="block truncate text-muted-foreground">{{ it.goal.title }} · ngày {{ it.reward.day }}</small>
          <span v-if="it.unlocked" class="mt-1 inline-flex items-center gap-1 text-xs font-black text-green-dark uppercase">
            <Icon name="hugeicons:checkmark-circle-02" class="size-4" /> {{ it.reward.openedAt ? 'Đã nhận' : 'Đã mở khoá' }}
          </span>
          <span v-else class="mt-1 inline-flex items-center gap-1 text-xs font-black text-muted-foreground uppercase">
            <Icon name="hugeicons:square-lock-02" class="size-4" /> Còn {{ it.left }} ngày
          </span>
        </div>
      </NuxtLink>
    </div>
    <p v-if="!items.length" class="mt-6 text-center text-muted-foreground">Chưa có phần thưởng nào.</p>
  </div>
</template>
