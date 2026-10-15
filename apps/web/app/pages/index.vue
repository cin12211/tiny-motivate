<script setup lang="ts">
import { toISODate } from '#shared/utils/dates'

useHead({ title: 'Motivation' })

const { goals } = useGoals()
const { user, logout } = useAuth()
const stats = computed(() => overallStats(goals.value))
const today = toISODate()
const name = computed(() => user.value?.name || 'bạn')
</script>

<template>
  <div>
    <!-- mobile: date chip + longest streak on top (the web shows the date in the top bar) -->
    <div class="flex items-center justify-between pt-[26px] pb-1.5 md:hidden">
      <Badge variant="solid">{{ dotDate(today) }}</Badge>
      <TypographyMuted as="span" class="inline-flex items-center gap-1.5">
        <Icon name="hugeicons:fire" class="size-4 text-indigo" />
        <span>chuỗi dài nhất <b class="font-semibold text-indigo">{{ pad2(stats.bestStreak) }}</b> ngày</span>
      </TypographyMuted>
    </div>

    <div class="flex flex-col items-center gap-2.5 pt-2.5 pb-[26px] text-center md:gap-1.5 md:pt-12 md:pb-7">
      <Mochi pose="wave" :size="96" class="max-md:size-[76px]" />
      <TypographyH1 class="hidden md:block">chào {{ name }} :)</TypographyH1>
      <TypographyLead>
        <span class="md:hidden">chào {{ name }} :)<br></span>
        <template v-if="stats.pending.length">hôm nay còn <em>{{ stats.pending.length }} mục tiêu</em> chưa tick</template>
        <template v-else>hôm nay xong hết rồi. <em>mỗi ngày đều đáng giá</em></template>
      </TypographyLead>
    </div>

    <!-- 30-day garden on phones, 120-day forest on the web -->
    <template v-if="goals.length">
      <Forest :goals="goals" :days="30" class="md:hidden" />
      <Forest :goals="goals" class="hidden md:flex" />
    </template>

    <section class="flex flex-col md:pt-[26px] md:dashed-top">
      <Badge class="mb-2.5 hidden self-center md:inline-flex">mục tiêu của bạn</Badge>
      <GoalCard v-for="g in goals" :key="g.id" :goal="g" />
      <div v-if="!goals.length" class="flex flex-col items-center gap-3 py-8 text-center dashed-top">
        <Mochi pose="sleepy" :size="84" />
        <TypographyMuted>chưa có mục tiêu nào. Mochi đang ngủ chờ bạn đó.</TypographyMuted>
      </div>
      <Button as-child variant="dashed" class="mt-2.5 w-full">
        <NuxtLink to="/goals/new"><Icon name="hugeicons:add-circle" class="size-5" /><span>mục tiêu mới</span></NuxtLink>
      </Button>
    </section>

    <div class="mt-9 hidden flex-col items-center md:flex">
      <TypographyMuted class="text-center leading-relaxed">mỗi ngày đều đáng giá,<br><TypographyHand class="mr-1 text-[30px]">Mochi</TypographyHand><Icon name="hugeicons:favourite" class="size-4 -translate-y-1 text-indigo" /></TypographyMuted>
    </div>
    <Button variant="ghost" size="sm" class="mx-auto mt-3.5 flex text-[11.5px]" @click="logout">
      <Icon name="hugeicons:logout-03" class="size-[15px]" /> đăng xuất
    </Button>
  </div>
</template>
