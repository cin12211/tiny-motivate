<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

useHead({ title: 'Tiny Motivate' })

const isDesktop = useMediaQuery('(min-width: 768px)')
const { goals } = useGoals()
const { user, logout } = useAuth()
const stats = computed(() => overallStats(goals.value))
const { t } = useI18n()
const name = computed(() => user.value?.name || t('home.you'))
</script>

<template>
  <div class="relative">
    <!-- web: settings link top right (phones use the bottom bar) -->
    <div class="hidden md:absolute md:top-[18px] md:right-0 md:flex md:gap-2">
      <Button as-child variant="link" size="xs" class="gap-1.5 px-1.5 text-xs">
        <NuxtLink to="/plant-book"><HandIcon name="books-01" />{{ $t('book.title') }}</NuxtLink>
      </Button>
      <Button as-child variant="link" size="xs" class="-mr-1.5 gap-1.5 px-1.5 text-xs">
        <NuxtLink to="/settings"><HandIcon name="settings-01" />{{ $t('common.settings') }}</NuxtLink>
      </Button>
    </div>

    <!-- phones: greeting + garden as one focus block (v64) -->
    <div class="max-md:pt-[max(24px,5vh)]">
    <!-- Germi on its own line above the centred greeting (phones 88px, web 96px) -->
    <div class="flex flex-col items-center gap-1 pb-2 text-center md:pt-5 md:pb-4">
      <GardenIcon icon="gm-idle" class="size-[88px] shrink-0 text-indigo md:size-24" />
      <!-- the user's name in Caveat (v59g) -->
      <TypographyH1 class="hidden md:block"><i18n-t keypath="home.hello" tag="span" scope="global"><template #name><span class="font-hand text-[1.6em] leading-none font-bold text-indigo">{{ name }}</span></template></i18n-t></TypographyH1>
      <TypographyLead class="max-md:text-[13px] max-md:leading-normal">
        <span class="md:hidden"><i18n-t keypath="home.hello" tag="span" scope="global"><template #name><span class="font-hand text-[1.6em] leading-none font-bold text-indigo">{{ name }}</span></template></i18n-t><br></span>
        <i18n-t v-if="stats.pending.length" keypath="home.pending" tag="span" scope="global"><template #goals><em>{{ $t('home.pendingGoals', stats.pending.length, { n: stats.pending.length }) }}</em></template></i18n-t>
        <template v-else>{{ $t('home.allDone') }}</template>
        <br class="md:hidden">
        <span class="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground md:hidden">
          <HandIcon name="fire" class="text-indigo" />
          <i18n-t keypath="home.streak" tag="span" scope="global"><template #n><b class="font-semibold text-indigo">{{ pad2(stats.bestStreak) }}</b></template></i18n-t>
        </span>
      </TypographyLead>
    </div>

    <!-- 60-day garden on phones, 120-day forest on the web (only render the active one) -->
    <Forest v-if="!isDesktop" :goals="goals" />
    <Forest v-else :goals="goals" web />
    </div>

    <section class="flex flex-col pt-1.5 md:pt-1">
      <Badge class="mb-1 self-center md:mb-2.5">{{ $t('home.yourGoals') }}</Badge>
      <GoalCard v-for="g in goals" :key="g.id" :goal="g" />
      <div v-if="!goals.length" class="flex flex-col items-center gap-3 py-8 text-center dashed-top">
        <Germi pose="sleepy" :size="84" />
        <TypographyMuted>{{ $t('home.empty') }}</TypographyMuted>
      </div>
      <Button as-child variant="dashed" class="mt-2.5 w-full">
        <NuxtLink to="/goals/new"><HandIcon name="add-circle" /><span>{{ $t('common.newGoal') }}</span></NuxtLink>
      </Button>
    </section>

    <div class="mt-[22px] hidden flex-col items-center md:flex">
      <TypographyMuted class="text-center leading-relaxed">{{ $t('home.sign') }}<br><TypographyHand class="mr-1 text-[30px]">Tiny Motivate</TypographyHand><HandIcon name="favourite" class="-translate-y-1 text-indigo" /></TypographyMuted>
    </div>
    <!-- web only: phones log out from the settings page -->
    <Button variant="ghost" size="sm" class="mx-auto mt-3.5 hidden text-[11.5px] md:flex" @click="logout">
      <HandIcon name="logout-03" /> {{ $t('common.logout') }}
    </Button>
  </div>
</template>
