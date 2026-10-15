<script setup lang="ts">
import type { Goal } from '#shared/types'

/**
 * Horizontal day strip at the top of a goal: done days show their plant,
 * reward days show the reward, today is a ring, the rest are dots.
 * The selected day is full opacity and centred.
 */
const props = defineProps<{ goal: Goal }>()
const selected = defineModel<number>({ required: true })

const scroller = ref<HTMLElement>()
const doneCount = computed(() => goalStats(props.goal).doneCount)

const days = computed(() =>
  Array.from({ length: props.goal.totalDays }, (_, i) => {
    const n = i + 1
    const reward = rewardAt(props.goal, n)
    return {
      n,
      status: dayStatus(props.goal, n),
      date: slashShort(dayDate(props.goal, n)),
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
    class="scrollbar-none relative -mx-[22px] flex snap-x snap-proximity gap-1.5 overflow-x-auto px-[40%] pt-3.5 pb-2.5 md:-mx-6 md:px-[45%]"
    role="listbox"
    aria-label="Các ngày"
  >
    <button
      v-for="d in days"
      :key="d.n"
      :data-day="d.n"
      role="option"
      :aria-selected="selected === d.n"
      :aria-label="`Ngày ${d.n}, ${d.date}${d.status === 'done' ? ', đã xong' : ''}${d.reward ? `, quà ${d.reward.title}` : ''}`"
      class="grid h-[52px] w-11 shrink-0 snap-center place-items-center text-indigo transition-[opacity,transform] duration-150 hover:opacity-70"
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
    </button>
  </div>
</template>
