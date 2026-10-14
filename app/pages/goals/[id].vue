<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { Reward } from '#shared/types'
import { useDebounceFn } from '@vueuse/core'

const route = useRoute()
const { goals, refresh, updateDay, openReward, remove } = useGoals()

const goal = computed(() => goals.value.find(g => g.id === route.params.id))
if (!goal.value) await refresh()
if (!goal.value) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy mục tiêu', fatal: true })

useHead({ title: () => `${goal.value?.title ?? 'Mục tiêu'} · Motivation` })

const s = computed(() => goalStats(goal.value!))
const selected = ref(Math.min(Math.max(s.value.today, 1), goal.value.totalDays))
const selectedDate = computed(() => dayDate(goal.value!, selected.value))
const entry = computed(() => goal.value?.days[String(selected.value)])
const status = computed(() => dayStatus(goal.value!, selected.value))
const isToday = computed(() => selected.value === s.value.today)
const isFuture = computed(() => selected.value > s.value.today)
const missedCount = computed(() => Math.max(0, Math.min(s.value.today - 1, goal.value!.totalDays) - Object.entries(goal.value!.days).filter(([n, d]) => d.done && Number(n) < s.value.today).length))

/* ---------- journal (autosaves) ---------- */
const draft = ref(entry.value?.journal ?? '')
const saveState = ref<'idle' | 'saving' | 'saved'>('idle')
watch(selected, () => {
  draft.value = entry.value?.journal ?? ''
  saveState.value = 'idle'
})

const persist = useDebounceFn(async (day: number, html: string) => {
  saveState.value = 'saving'
  try {
    await updateDay(goal.value!.id, day, { journal: html })
    saveState.value = 'saved'
  }
  catch (err: any) {
    saveState.value = 'idle'
    toast.error(err?.data?.statusMessage || 'Không lưu được nhật ký')
  }
}, 700)

function onDraft(html: string) {
  draft.value = html
  if (!isFuture.value && html !== (entry.value?.journal ?? '')) persist(selected.value, html)
}

/* ---------- tick done + rewards ---------- */
const celebrate = ref(false)
const celebrateMode = ref<'done' | 'reward'>('done')
const celebrateReward = ref<Reward | null>(null)
const ticking = ref(false)

async function tickDone() {
  if (!isToday.value || entry.value?.done) return
  ticking.value = true
  try {
    const before = s.value.doneCount
    const g = await updateDay(goal.value!.id, selected.value, { journal: draft.value, done: true })
    const after = Object.values(g.days).filter(d => d.done).length
    const unlocked = g.rewards.find(r => r.day > before && r.day <= after)
    celebrateReward.value = unlocked ?? null
    celebrateMode.value = unlocked ? 'reward' : 'done'
    celebrate.value = true
  }
  catch (err: any) {
    toast.error(err?.data?.statusMessage || 'Không tick được')
  }
  finally {
    ticking.value = false
  }
}

function showReward(r: Reward) {
  celebrateReward.value = r
  celebrateMode.value = 'reward'
  celebrate.value = true
}

async function onOpened(r: Reward) {
  try {
    await openReward(goal.value!.id, r.id)
  }
  catch {}
}

async function onDelete() {
  // eslint-disable-next-line no-alert
  if (!confirm(`Xoá mục tiêu "${goal.value!.title}"? Không thể hoàn tác.`)) return
  await remove(goal.value!.id)
  toast.success('Đã xoá mục tiêu')
  await navigateTo('/')
}

const dateLabel = computed(() => {
  const [y, m, d] = selectedDate.value.split('-')
  return `${weekdayShort(selectedDate.value)}, ${d}/${m}/${y}`
})
</script>

<template>
  <div v-if="goal">
    <!-- header -->
    <div class="flex flex-wrap items-center gap-4">
      <div class="flex min-w-[260px] flex-1 items-center gap-3">
        <Button as-child variant="outline" size="icon" aria-label="Quay lại" class="lg:hidden">
          <NuxtLink to="/"><Icon name="hugeicons:arrow-left-01" /></NuxtLink>
        </Button>
        <div class="grid size-[52px] shrink-0 place-items-center rounded-2xl border-2 border-b-4 border-line bg-surface text-sky lg:size-[62px]">
          <Icon :name="`hugeicons:${goal.icon}`" class="size-[55%]" />
        </div>
        <div class="min-w-0">
          <h2 class="text-[23px] leading-tight lg:text-[30px]">{{ goal.title }}</h2>
          <small class="text-[13px] text-muted-foreground">Bắt đầu {{ shortDate(goal.startDate) }} · {{ goal.totalDays }} ngày</small>
        </div>
      </div>

      <div class="flex w-full items-center gap-3 rounded-2xl bg-green px-3.5 py-3 text-white shadow-[0_4px_0_var(--m-green-dark)] sm:w-auto sm:min-w-[300px] sm:flex-[0_1_380px]">
        <div class="grid size-[50px] shrink-0 place-items-center overflow-hidden rounded-xl bg-black/10 text-[28px]">
          <RewardBadge v-if="s.nextReward" :reward="s.nextReward" icon-class="size-7" />
          <Icon v-else name="hugeicons:champion" class="size-7" />
        </div>
        <div class="min-w-0">
          <template v-if="s.nextReward">
            <span class="text-[11.5px] font-bold tracking-wide uppercase opacity-90">Còn {{ s.daysToNext }} ngày nữa</span>
            <b class="block truncate text-xl leading-tight font-black">{{ s.nextReward.title }}</b>
          </template>
          <template v-else>
            <span class="text-[11.5px] font-bold tracking-wide uppercase opacity-90">Tuyệt quá</span>
            <b class="block text-xl leading-tight font-black">Đã mở khoá mọi phần thưởng</b>
          </template>
        </div>
      </div>
    </div>

    <!-- day strip -->
    <div class="mt-5">
      <DayStrip v-model="selected" :goal="goal" />
    </div>

    <div class="mt-1 grid items-start gap-x-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <!-- left: journal + tick -->
      <div>
        <Card class="mt-4 px-4">
          <div class="flex items-center justify-between gap-2">
            <h3 class="text-lg">Nhật ký ngày {{ selected }}</h3>
            <small class="flex items-center gap-1 text-[12.5px] text-muted-foreground">
              <template v-if="saveState === 'saving'">Đang lưu…</template>
              <template v-else-if="saveState === 'saved'"><Icon name="hugeicons:checkmark-circle-02" class="size-4 text-green" /> Đã lưu</template>
              <template v-else>{{ dateLabel }}</template>
            </small>
          </div>

          <div v-if="isFuture" class="flex items-center gap-3 rounded-2xl border-2 border-line bg-field p-3 text-[13.5px]">
            <Mochi pose="sleepy" :size="56" class="shrink-0" />
            <span>Chưa tới ngày này đâu. Quay lại vào {{ dateLabel }} để ghi nhật ký và tick nhé!</span>
          </div>
          <template v-else>
            <JournalEditor :model-value="draft" :key="selected" @update:model-value="onDraft" />
            <p v-if="status === 'missed'" class="text-[13px] text-muted-foreground">
              Ngày này đã qua nên không tick được nữa, nhưng bạn vẫn có thể ghi lại nhật ký. Lỡ một ngày không làm mất quà đâu!
            </p>
          </template>

          <Button
            v-if="isToday || entry?.done"
            size="lg"
            class="w-full text-base"
            :variant="entry?.done ? 'soft' : 'default'"
            :disabled="ticking || (!entry?.done && !isToday)"
            @click="tickDone"
          >
            <span class="grid size-[30px] place-items-center rounded-full border-[3px]" :class="entry?.done ? 'border-green bg-green text-white' : 'border-white'">
              <Icon name="hugeicons:tick-02" class="size-[18px]" />
            </span>
            {{ entry?.done ? 'Đã hoàn thành' : ticking ? 'Đang lưu…' : 'Hoàn thành hôm nay' }}
          </Button>
          <Button v-else size="lg" class="w-full text-base" disabled>
            <Icon name="hugeicons:square-lock-02" />
            {{ isFuture ? 'Chưa tới ngày' : 'Đã qua ngày' }}
          </Button>
        </Card>
      </div>

      <!-- right: progress + reward road -->
      <div>
        <Card class="mt-4 px-4">
          <h3 class="text-lg">Tiến độ</h3>
          <div class="flex items-center gap-4">
            <div class="text-[40px] leading-none font-black tabular-nums">
              {{ s.doneCount }}<small class="text-lg font-semibold text-muted-foreground">/{{ goal.totalDays }}</small>
            </div>
            <div class="flex-1">
              <Progress :model-value="s.percent" />
              <p class="mt-1 text-xs text-muted-foreground">{{ s.percent }}% chặng đường</p>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div class="chunky px-2.5 py-2">
              <strong class="flex items-center gap-1 text-xl font-black text-orange tabular-nums"><Icon name="hugeicons:fire" class="size-[0.9em]" />{{ s.streak }}</strong>
              <span class="text-[11.5px] text-muted-foreground">Chuỗi hiện tại</span>
            </div>
            <div class="chunky px-2.5 py-2">
              <strong class="flex items-center gap-1 text-xl font-black tabular-nums"><Icon name="hugeicons:checkmark-circle-02" class="size-[0.9em] text-green" />{{ s.doneCount }}</strong>
              <span class="text-[11.5px] text-muted-foreground">Ngày đã xong</span>
            </div>
            <div class="chunky px-2.5 py-2">
              <strong class="flex items-center gap-1 text-xl font-black tabular-nums"><Icon name="hugeicons:gift" class="size-[0.9em] text-yellow-dark" />{{ s.unlocked.length }}/{{ goal.rewards.length }}</strong>
              <span class="text-[11.5px] text-muted-foreground">Quà đã mở</span>
            </div>
          </div>
          <p v-if="missedCount" class="text-xs text-muted-foreground">Đã lỡ {{ missedCount }} ngày, không sao cả, quà vẫn chờ bạn.</p>
        </Card>

        <Card class="mt-4 px-4">
          <h3 class="text-lg">Con đường phần thưởng</h3>
          <RewardRoad :goal="goal" @open="showReward" />
        </Card>

        <Button variant="ghost" size="sm" class="mt-4 w-full text-red" @click="onDelete">
          <Icon name="hugeicons:delete-02" /> Xoá mục tiêu
        </Button>
      </div>
    </div>

    <CelebrateDialog
      v-model:open="celebrate"
      :mode="celebrateMode"
      :reward="celebrateReward"
      :streak="s.streak"
      @opened="onOpened"
    />
  </div>
</template>
