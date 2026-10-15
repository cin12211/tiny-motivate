<script setup lang="ts">
import { toISODate } from '#shared/utils/dates'

useHead({ title: 'Motivation' })

const { goals } = useGoals()
const { user, logout } = useAuth()
const stats = computed(() => overallStats(goals.value))
const today = toISODate()
const { t } = useI18n()
const name = computed(() => user.value?.name || t('home.you'))
</script>

<template>
  <div class="relative">
    <!-- top row: date chip (phones; the web shows it in the header) + settings link -->
    <div class="flex items-center justify-between pt-5 md:absolute md:top-[18px] md:right-6 md:pt-0">
      <span class="flex items-center gap-2 md:hidden">
        <LogoTile :size="28" />
        <Badge variant="solid">{{ dotDate(today) }}</Badge>
      </span>
      <Button as-child variant="link" size="xs" class="-mr-1.5 gap-1.5 px-1.5 text-xs">
        <NuxtLink to="/settings"><Icon name="hugeicons:settings-01" class="size-[15px]" />{{ $t('common.settings') }}</NuxtLink>
      </Button>
    </div>

    <!-- phones: small Mochi beside the greeting; web: big Mochi above it -->
    <div class="flex items-center justify-center gap-3.5 pt-1.5 pb-3.5 text-left md:flex-col md:gap-1.5 md:pt-12 md:pb-7 md:text-center">
      <Mochi pose="wave" :size="96" class="max-md:size-16" />
      <TypographyH1 class="hidden md:block">{{ $t('home.hello', { name }) }}</TypographyH1>
      <TypographyLead class="max-md:text-[13px] max-md:leading-normal">
        <span class="md:hidden">{{ $t('home.hello', { name }) }}<br></span>
        <i18n-t v-if="stats.pending.length" keypath="home.pending" tag="span" scope="global"><template #goals><em>{{ $t('home.pendingGoals', stats.pending.length, { n: stats.pending.length }) }}</em></template></i18n-t>
        <template v-else>{{ $t('home.allDone') }}</template>
        <br>
        <span class="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon name="hugeicons:fire" class="size-3.5 text-indigo" />
          <i18n-t keypath="home.streak" tag="span" scope="global"><template #n><b class="font-semibold text-indigo">{{ pad2(stats.bestStreak) }}</b></template></i18n-t>
        </span>
      </TypographyLead>
    </div>

    <!-- 60-day garden on phones, 120-day forest on the web -->
    <template v-if="goals.length">
      <Forest :goals="goals" :days="60" class="md:hidden" />
      <Forest :goals="goals" class="hidden md:flex" />
    </template>

    <section class="flex flex-col md:pt-[26px] md:dashed-top">
      <Badge class="mb-2.5 hidden self-center md:inline-flex">{{ $t('home.yourGoals') }}</Badge>
      <GoalCard v-for="g in goals" :key="g.id" :goal="g" />
      <div v-if="!goals.length" class="flex flex-col items-center gap-3 py-8 text-center dashed-top">
        <Mochi pose="sleepy" :size="84" />
        <TypographyMuted>{{ $t('home.empty') }}</TypographyMuted>
      </div>
      <Button as-child variant="dashed" class="mt-2.5 w-full">
        <NuxtLink to="/goals/new"><Icon name="hugeicons:add-circle" class="size-5" /><span>{{ $t('common.newGoal') }}</span></NuxtLink>
      </Button>
    </section>

    <div class="mt-9 hidden flex-col items-center md:flex">
      <TypographyMuted class="text-center leading-relaxed">{{ $t('home.sign') }}<br><TypographyHand class="mr-1 text-[30px]">Mochi</TypographyHand><Icon name="hugeicons:favourite" class="size-4 -translate-y-1 text-indigo" /></TypographyMuted>
    </div>
    <Button variant="ghost" size="sm" class="mx-auto mt-3.5 flex text-[11.5px]" @click="logout">
      <Icon name="hugeicons:logout-03" class="size-[15px]" /> {{ $t('common.logout') }}
    </Button>
  </div>
</template>
