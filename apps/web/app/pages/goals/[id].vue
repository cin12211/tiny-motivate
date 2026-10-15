<script setup lang="ts">
import { h } from 'vue'
import { toast } from 'vue-sonner'
import { useDebounceFn } from '@vueuse/core'
import type { MoodId, Reward } from '#shared/types'
import Mochi from '~/components/Mochi.vue'

const route = useRoute()
const { goals, refresh, updateDay, openReward, remove } = useGoals()

const goal = computed(() => goals.value.find(g => g.id === route.params.id))
if (!goal.value) await refresh()
if (!goal.value) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy mục tiêu', fatal: true })

useHead({ title: () => `${goal.value?.title ?? 'Mục tiêu'} · Motivation` })

const s = computed(() => goalStats(goal.value!))
const selected = ref(Math.min(Math.max(s.value.today, 1), goal.value.totalDays))
const entry = computed(() => goal.value?.days[String(selected.value)])
const isToday = computed(() => selected.value === s.value.today)
const isFuture = computed(() => selected.value > s.value.today)
const selectedReward = computed(() => rewardAt(goal.value!, selected.value))

const dayLabel = computed(() => {
  if (isToday.value) return 'hôm nay'
  if (selected.value === s.value.today - 1) return 'hôm qua'
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
    await updateDay(goal.value!.id, day, input)
  }
  catch (err) {
    toast(errorMessage(err, 'Không lưu được nhật ký'))
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

async function toggleDone() {
  if (!isToday.value) return
  ticking.value = true
  const before = s.value.unlocked.length
  try {
    const g = await updateDay(goal.value!.id, selected.value, { journal: draft.value, done: !entry.value?.done })
    if (!g.days[String(selected.value)]?.done) return
    confettiBurst()
    const now = goalStats(g)
    if (now.unlocked.length > before) {
      const reward = now.unlocked.at(-1)!
      unlockedReward.value = reward
      setTimeout(() => (rewardOpen.value = true), 500)
      openReward(g.id, reward.id).catch(() => {})
    }
    else {
      toast(`đã trồng thêm một mầm. chuỗi ${now.streak} ngày :)`, { icon: h(Mochi, { pose: 'cheer', size: 28, class: 'text-on-indigo' }) })
    }
  }
  catch (err) {
    toast(errorMessage(err, 'Không tick được'))
  }
  finally {
    ticking.value = false
  }
}

async function onDelete() {
  // eslint-disable-next-line no-alert
  if (!confirm(`Xoá mục tiêu "${goal.value!.title}"? Không thể hoàn tác.`)) return
  await remove(goal.value!.id)
  toast('đã xoá mục tiêu')
  await navigateTo('/')
}
</script>

<template>
  <div v-if="goal">
    <!-- top bar: back · day chip · goal icon (sticky, under the web header on md+) -->
    <div class="sticky top-0 z-10 -mx-[22px] bg-gradient-to-b from-background from-75% to-transparent px-[22px] pt-3.5 pb-2.5 md:top-[58px] md:-mx-6 md:px-6 md:pt-3">
      <div class="flex items-center justify-between">
        <Button as-child variant="ghost" size="icon" class="text-indigo md:w-auto md:gap-1.5 md:pr-2.5 md:pl-1.5 md:text-[12.5px]" aria-label="Quay lại">
          <NuxtLink to="/"><Icon name="hugeicons:arrow-left-01" class="size-5" /><span class="hidden md:inline">tất cả mục tiêu</span></NuxtLink>
        </Button>
        <Badge class="md:absolute md:left-1/2 md:-translate-x-1/2">{{ dayLabel }}</Badge>
        <span class="grid w-9 place-items-center text-indigo md:invisible">
          <Icon :name="`hugeicons:${goal.icon}`" class="size-5" />
        </span>
      </div>
    </div>

    <DayStrip v-model="selected" :goal="goal" />
    <TypographyH2 class="mt-0.5 flex items-center justify-center gap-1.5 text-center text-[13px] text-muted-foreground">
      <Icon :name="`hugeicons:${goal.icon}`" class="hidden size-[18px] md:inline" />{{ goal.title }}
    </TypographyH2>

    <!-- journal -->
    <div v-if="isFuture" class="flex min-h-[230px] flex-col items-center justify-center gap-3 px-1.5 pt-7 pb-2 text-center">
      <Mochi pose="sleepy" :size="84" />
      <TypographyP>
        chưa tới ngày này.
        <template v-if="selectedReward"><br>hôm đó bạn sẽ mở <em>{{ selectedReward.title }}</em></template>
      </TypographyP>
    </div>
    <JournalEditor v-else :key="selected" :model-value="draft" :label="`Nhật ký ngày ${selected}`" @update:model-value="onDraft">
      <template #between>
        <MoodPicker :model-value="mood" @update:model-value="onMood" />
      </template>
      <template #actions>
        <TypographyMuted v-if="!isToday && !entry?.done" as="span">ngày này đã qua</TypographyMuted>
        <Button
          v-else-if="entry?.done"
          variant="soft"
          size="sm"
          class="h-10 px-[18px] text-[13px]"
          :disabled="!isToday || ticking"
          :title="isToday ? 'Bấm để bỏ tick' : undefined"
          @click="toggleDone"
        >
          <Icon name="hugeicons:checkmark-circle-02" /> đã xong
        </Button>
        <Button v-else variant="hand" class="h-10 px-[18px] text-[22px]" :disabled="ticking" @click="toggleDone">done</Button>
      </template>
    </JournalEditor>

    <!-- countdown + stats -->
    <TypographyP class="mt-[22px] mb-1.5 text-center">
      <template v-if="s.nextReward">
        còn <em>{{ pad2(s.daysToNext) }}</em> ngày nữa tới<br>
        <span class="inline-flex items-center gap-1.5 text-indigo">
          <span class="grid size-5 place-items-center overflow-hidden rounded"><RewardBadge :reward="s.nextReward" icon-class="size-[18px]" /></span>
          {{ s.nextReward.title }}
        </span>
      </template>
      <template v-else>bạn đã mở hết quà rồi :)</template>
    </TypographyP>
    <div class="mt-2 mb-6 flex justify-center gap-[18px]">
      <TypographyMuted as="span"><b class="font-semibold text-indigo">{{ pad2(s.doneCount) }}</b>/{{ goal.totalDays }} ngày</TypographyMuted>
      <TypographyMuted as="span"><b class="font-semibold text-indigo">{{ pad2(s.streak) }}</b> chuỗi</TypographyMuted>
      <TypographyMuted as="span"><b class="font-semibold text-indigo">{{ s.unlocked.length }}</b>/{{ goal.rewards.length }} quà</TypographyMuted>
    </div>

    <GardenGrid v-model="selected" :goal="goal" />
    <RewardList :goal="goal" />

    <Button variant="ghost" size="sm" class="mx-auto mt-8 flex text-[11.5px]" @click="onDelete">
      <Icon name="hugeicons:delete-02" class="size-[15px]" /> xoá mục tiêu
    </Button>

    <RewardDialog v-model:open="rewardOpen" :reward="unlockedReward" />
  </div>
</template>
