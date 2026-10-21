<script setup lang="ts">
import { h } from 'vue'
import { toast } from 'vue-sonner'
import { useDebounceFn } from '@vueuse/core'
import type { MoodId, Reward } from '#shared/types'
import Germi from '~/components/Germi.vue'

const route = useRoute()
const { t } = useI18n()
const { goals, refresh, updateDay, patchDay, openReward, remove } = useGoals()

const goal = computed(() => goals.value.find(g => g.id === route.params.id))
if (!goal.value) await refresh()
if (!goal.value) throw createError({ statusCode: 404, statusMessage: t('goal.notFound'), fatal: true })

useHead({ title: () => `${goal.value?.title ?? t('goal.title')} · Tiny Motivate` })

const s = computed(() => goalStats(goal.value!))
// ?day=N (from the day page) opens that day; otherwise today
const askedDay = Number(route.query.day)
const selected = ref(Math.min(Math.max(Number.isInteger(askedDay) && askedDay > 0 ? askedDay : s.value.today, 1), goal.value.totalDays))
const entry = computed(() => goal.value?.days[String(selected.value)])
const isToday = computed(() => selected.value === s.value.today)
const isFuture = computed(() => selected.value > s.value.today)
const selectedReward = computed(() => rewardAt(goal.value!, selected.value))

const dayLabel = computed(() => {
  if (isToday.value) return t('common.today')
  if (selected.value === s.value.today - 1) return t('common.yesterday')
  return dotDate(dayDate(goal.value!, selected.value))
})

/* ---------- journal + mood (autosave) ---------- */
const draft = ref(entry.value?.journal ?? '')
const mood = ref<MoodId | null | undefined>(entry.value?.mood)
watch(selected, () => {
  draft.value = entry.value?.journal ?? ''
  mood.value = entry.value?.mood
})

async function save(input: { journal?: string, mood?: MoodId | null }, day = selected.value) {
  try {
    await patchDay(goal.value!.id, day, input)
  }
  catch (err) {
    toast(errorMessage(err, t('goal.errSave')))
  }
}
const saveJournal = useDebounceFn((day: number, html: string) => save({ journal: html }, day), 700)

function onDraft(html: string) {
  draft.value = html
  if (html !== (entry.value?.journal ?? '')) saveJournal(selected.value, html)
}
function onMood(value: MoodId | null | undefined) {
  mood.value = value
  save({ mood: value ?? null })
}

/* ---------- tick done + rewards ---------- */
const ticking = ref(false)
const rewardOpen = ref(false)
const unlockedReward = ref<Reward | null>(null)

/**
 * Optimistic: the tick, confetti and reward show up straight away; the save
 * runs in the background and an error puts the day back (and says so).
 */
async function toggleDone() {
  if (!isToday.value || ticking.value) return
  ticking.value = true
  const before = s.value.unlocked.length
  const saving = updateDay(goal.value!.id, selected.value, { journal: draft.value, done: !entry.value?.done })
  const g = goal.value!
  if (g.days[String(selected.value)]?.done) {
    confettiBurst()
    const now = goalStats(g)
    if (now.unlocked.length > before) {
      const reward = now.unlocked.at(-1)!
      unlockedReward.value = reward
      setTimeout(() => (rewardOpen.value = true), 500)
      saving.then(() => openReward(g.id, reward.id)).catch(() => {})
    }
    else {
      toast(t('goal.planted', { n: now.streak }), { icon: h(Germi, { pose: 'cheer', size: 28, class: 'text-on-indigo [--gm-bg:var(--m-indigo)]' }) })
    }
  }
  try {
    await saving
  }
  catch (err) {
    rewardOpen.value = false
    toast(errorMessage(err, t('goal.errTick')))
  }
  finally {
    ticking.value = false
  }
}

async function onDelete() {
  // eslint-disable-next-line no-alert
  if (!confirm(t('goal.confirmDelete', { title: goal.value!.title }))) return
  await remove(goal.value!.id)
  toast(t('goal.deleted'))
  await navigateTo('/')
}
</script>

<template>
  <div v-if="goal">
    <!-- top bar: back · day chip · goal icon (sticky, under the web header on md+) -->
    <div class="app-header sticky top-0 z-10 -mx-[22px] bg-gradient-to-b from-background from-75% to-transparent px-[22px] pt-3.5 pb-2.5 md:top-0 md:-mx-7 md:px-7 max-[860px]:md:-mx-4 max-[860px]:md:px-4 md:pt-3">
      <div class="flex items-center justify-between">
        <Button as-child variant="ghost" size="icon" class="app-header-btn text-indigo md:w-auto md:gap-1.5 md:pr-2.5 md:pl-1.5 md:text-[12.5px]" 
          :aria-label="$t('common.back')">
          <NuxtLink to="/"><HandIcon name="arrow-left-01" /><span class="hidden md:inline">{{ $t('common.allGoals') }}</span></NuxtLink>
        </Button>
        <Badge class="app-header-chip md:absolute md:left-1/2 md:-translate-x-1/2">{{ dayLabel }}</Badge>
        <span class="app-header-btn grid w-9 place-items-center text-indigo md:invisible">
          <HandIcon :name="goal.icon" />
        </span>
      </div>
    </div>

    <DayStrip v-model="selected" :goal="goal" />
    <TypographyH2 class="mt-0.5 flex items-center justify-center gap-1.5 text-center text-[13px] text-muted-foreground">
      <HandIcon :name="goal.icon" class="hidden md:inline" />{{ goal.title }}
    </TypographyH2>

    <!-- journal -->
    <div v-if="isFuture" class="flex min-h-[230px] flex-col items-center justify-center gap-3 px-1.5 pt-7 pb-2 text-center">
      <Germi pose="sleepy" :size="84" />
      <TypographyP>
        {{ $t('goal.notYet') }}
        <template v-if="selectedReward"><br><i18n-t keypath="goal.willOpen" tag="span" scope="global"><template #reward><em>{{ selectedReward.title }}</em></template></i18n-t></template>
      </TypographyP>
    </div>
    <JournalEditor v-else :key="selected" :model-value="draft" :label="$t('goal.journalOf', { n: selected })" @update:model-value="onDraft">
      <template #between>
        <MoodPicker :model-value="mood" @update:model-value="onMood" />
      </template>
      <template #actions>
        <TypographyMuted v-if="!isToday && !entry?.done" as="span">{{ $t('goal.past') }}</TypographyMuted>
        <Button
          v-else-if="entry?.done"
          variant="soft"
          size="sm"
          class="h-10 px-[18px] text-[13px]"
          :disabled="!isToday || ticking"
          :title="isToday ? $t('goal.untickHint') : undefined"
          @click="toggleDone"
        >
          <HandIcon name="checkmark-circle-02" /> {{ $t('goal.done') }}
        </Button>
        <Button v-else variant="hand" class="h-10 px-[18px] text-[22px]" :disabled="ticking" @click="toggleDone">done</Button>
      </template>
    </JournalEditor>

    <!-- countdown + stats -->
    <TypographyP class="mt-[22px] mb-1.5 text-center md:mt-3 md:mb-1">
      <template v-if="s.nextReward">
        <i18n-t keypath="goal.countdown" tag="span" scope="global"><template #n><em>{{ pad2(s.daysToNext) }}</em></template></i18n-t><br>
        <span class="inline-flex items-center gap-1.5 text-indigo">
          <span class="grid size-6 place-items-center overflow-hidden rounded"><RewardBadge :reward="s.nextReward" /></span>
          {{ s.nextReward.title }}
        </span>
      </template>
      <template v-else>{{ $t('goal.allRewards') }}</template>
    </TypographyP>
    <div class="mt-2 mb-6 flex justify-center gap-[18px] md:mt-1.5 md:mb-3.5">
      <i18n-t keypath="goal.statDays" tag="span" scope="global" class="text-xs text-muted-foreground"><template #done><b class="font-semibold text-indigo">{{ pad2(s.doneCount) }}</b></template><template #total>{{ goal.totalDays }}</template></i18n-t>
      <i18n-t keypath="goal.statStreak" tag="span" scope="global" class="text-xs text-muted-foreground"><template #n><b class="font-semibold text-indigo">{{ pad2(s.streak) }}</b></template></i18n-t>
      <i18n-t keypath="goal.statRewards" tag="span" scope="global" class="text-xs text-muted-foreground"><template #got><b class="font-semibold text-indigo">{{ s.unlocked.length }}</b></template><template #total>{{ goal.rewards.length }}</template></i18n-t>
    </div>

    <GardenGrid v-model="selected" :goal="goal" />
    <RewardList :goal="goal" />
    <GoalRemind :goal="goal" />

    <Button variant="ghost" size="sm" class="mx-auto mt-8 flex text-[11.5px]" @click="onDelete">
      <HandIcon name="delete-02" /> {{ $t('goal.delete') }}
    </Button>

    <RewardDialog v-model:open="rewardOpen" :reward="unlockedReward" />
  </div>
</template>
