<script setup lang="ts">
import type { Goal } from '#shared/types'

/**
 * Horizontal day strip at the top of a goal: done days show their plant,
 * reward days show the reward, today is a ring, the rest are dots.
 * The selected day is full opacity and centred. Each day has a small
 * "dd.mm" label underneath ("today" for today).
 */
const props = defineProps<{ goal: Goal }>()
const selected = defineModel<number>({ required: true })

const scroller = ref<HTMLElement>()
const stats = computed(() => goalStats(props.goal))
const doneCount = computed(() => stats.value.doneCount)

const days = computed(() =>
  Array.from({ length: props.goal.totalDays }, (_, i) => {
    const n = i + 1
    const reward = rewardAt(props.goal, n)
    return {
      n,
      status: dayStatus(props.goal, n),
      date: slashShort(dayDate(props.goal, n)),
      label: dotShort(dayDate(props.goal, n)),
      isToday: n === stats.value.today,
      reward,
      got: !!reward && doneCount.value >= reward.day,
    }
  }),
)

function center(behavior: ScrollBehavior = 'smooth') {
  const strip = scroller.value
  const el = strip?.querySelector<HTMLElement>(`[data-day="${selected.value}"]`)
  if (!strip || !el) return
  strip.scrollTo({ left: el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2, behavior })
}

onMounted(() => nextTick(() => center('instant')))
watch(selected, () => nextTick(() => center()))
</script>

<template>
  <div
    ref="scroller"
    class="scrollbar-none relative -mx-[22px] flex snap-x snap-proximity gap-1.5 overflow-x-auto px-[40%] pt-3.5 pb-4 md:-mx-7 md:px-[45%] max-[860px]:md:-mx-4 md:pt-2.5 md:pb-3"
    role="listbox"
    :aria-label="$t('goal.days')"
  >
    <button
      v-for="d in days"
      :key="d.n"
      :data-day="d.n"
      role="option"
      :aria-selected="selected === d.n"
      :aria-label="$t('goal.dayAria', { n: d.n, date: d.date }) + (d.status === 'done' ? $t('goal.dayDone') : '') + (d.reward ? $t('goal.dayReward', { reward: d.reward.title }) : '')"
      class="grid w-11 shrink-0 snap-center grid-rows-[44px_auto] place-items-center gap-y-0.5 text-indigo transition-[opacity,transform] duration-150 hover:opacity-70"
      :class="selected === d.n ? 'scale-[1.18] opacity-100 hover:opacity-100' : d.reward && !d.got ? 'opacity-20' : 'opacity-30'"
      @click="selected = d.n"
    >
      <span v-if="d.reward" class="grid size-[34px] place-items-center overflow-hidden rounded-md">
        <RewardBadge :reward="d.reward" icon-class="size-[30px]" />
      </span>
      <GardenIcon v-else-if="d.status === 'done'" :day="d.n" class="size-9" />
      <i
        v-else
        class="block rounded-full"
        :class="d.status === 'today' ? 'size-3 border-2 border-indigo' : d.status === 'missed' ? 'size-[5px] bg-muted-foreground' : 'size-[5px] bg-indigo'"
      />
      <small
        class="text-[9.5px] leading-none tracking-[.01em] whitespace-nowrap text-indigo"
        :class="[(selected === d.n || d.isToday) && 'font-semibold', selected === d.n && 'text-[8.5px]']"
      >{{ d.isToday ? $t('common.today') : d.label }}</small>
    </button>
  </div>
</template>
