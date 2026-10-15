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
  <div class="relative">
    <!-- top row: date chip (phones; the web shows it in the header) + settings link -->
    <div class="flex items-center justify-between pt-5 md:absolute md:top-[18px] md:right-6 md:pt-0">
      <Badge variant="solid" class="md:hidden">{{ dotDate(today) }}</Badge>
      <Button as-child variant="link" size="xs" class="-mr-1.5 gap-1.5 px-1.5 text-xs">
        <NuxtLink to="/settings"><Icon name="hugeicons:settings-01" class="size-[15px]" />cài đặt</NuxtLink>
      </Button>
    </div>

    <!-- phones: small Mochi beside the greeting; web: big Mochi above it -->
    <div class="flex items-center justify-center gap-3.5 pt-1.5 pb-3.5 text-left md:flex-col md:gap-1.5 md:pt-12 md:pb-7 md:text-center">
      <Mochi pose="wave" :size="96" class="max-md:size-16" />
      <TypographyH1 class="hidden md:block">chào {{ name }} :)</TypographyH1>
      <TypographyLead class="max-md:text-[13px] max-md:leading-normal">
        <span class="md:hidden">chào {{ name }} :)<br></span>
        <template v-if="stats.pending.length">hôm nay còn <em>{{ stats.pending.length }} mục tiêu</em> chưa tick</template>
        <template v-else>hôm nay xong hết rồi.</template>
        <br>
        <span class="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon name="hugeicons:fire" class="size-3.5 text-indigo" />
          chuỗi dài nhất <b class="font-semibold text-indigo">{{ pad2(stats.bestStreak) }}</b> ngày
        </span>
      </TypographyLead>
    </div>

    <!-- 60-day garden on phones, 120-day forest on the web -->
    <template v-if="goals.length">
      <Forest :goals="goals" :days="60" class="md:hidden" />
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
