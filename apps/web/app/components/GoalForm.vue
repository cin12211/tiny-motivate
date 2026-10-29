<script setup lang="ts">
import { h } from 'vue'
import { toast } from 'vue-sonner'
import type { Goal } from '#shared/types'
import { toISODate } from '#shared/utils/dates'
import Germi from '~/components/Germi.vue'
import { cn } from '@/lib/utils'

/**
 * The goal form: creating a goal (/goals/new) or editing one (v72,
 * /goals/edit/:id, prefilled). When editing, rewards already received
 * (ticked days ≥ their day) are locked, other milestones must come after the
 * days already done, and the goal can't get shorter than what's been done.
 * The server checks the same rules (server/utils/goals.ts › updateGoal).
 */
const props = defineProps<{ goal?: Goal }>()
const editing = computed(() => !!props.goal)

const { t } = useI18n()
const { create, updateGoal, upload } = useGoals()

interface DraftReward { key: number, id?: string, day: number, title: string, icon: string, image: string | null, locked: boolean }

let seq = 0
const g = props.goal
/** days ticked so far (0 for a new goal) */
const ticked = g ? goalStats(g).doneCount : 0
const title = ref(g?.title ?? '')
const icon = ref(g?.icon ?? GOAL_ICONS[0]!)
const totalDays = ref(g?.totalDays ?? 30)
const startDate = ref(g?.startDate ?? toISODate())
const remind = ref<string | null>(g?.remind ?? null)
const rewards = ref<DraftReward[]>(g
  ? [...g.rewards].sort((a, b) => a.day - b.day).map(r => ({ key: seq++, id: r.id, day: r.day, title: r.title, icon: r.icon, image: r.image, locked: ticked >= r.day }))
  : [
      { key: seq++, day: 3, title: t('create.defaultReward1'), icon: 'bubble-tea-01', image: null, locked: false },
      { key: seq++, day: 7, title: t('create.defaultReward2'), icon: 'restaurant-01', image: null, locked: false },
      { key: seq++, day: 30, title: '', icon: 'gift', image: null, locked: false },
    ])
/** the goal can't get shorter than the days done (or the last day ticked) or a reward already received */
const lastTicked = g ? Math.max(0, ...Object.entries(g.days).filter(([, d]) => d.done).map(([n]) => Number(n))) : 0
const minDays = Math.max(3, ticked, lastTicked, ...rewards.value.filter(r => r.locked).map(r => r.day))
/** milestones still to come start the day after the last one done */
const firstOpenDay = ticked + 1
const presets = [7, 21, 30, 66]
const pickerFor = ref<number | null>(null)
const uploading = ref<number | null>(null)
const saving = ref(false)
const error = ref('')

const track = computed(() => rewards.value.filter(r => r.day >= 1 && r.day <= totalDays.value))

function setDays(n: number) {
  totalDays.value = Math.min(365, Math.max(minDays, n))
}

function addReward() {
  const last = rewards.value.reduce((m, r) => Math.max(m, r.day), 0)
  const day = Math.max(firstOpenDay, Math.min(totalDays.value, last + 7))
  rewards.value.push({ key: seq++, day, title: '', icon: 'gift', image: null, locked: false })
}
function removeReward(key: number) {
  rewards.value = rewards.value.filter(r => r.key !== key || r.locked)
  if (pickerFor.value === key) pickerFor.value = null
}

async function onFile(r: DraftReward, e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) return toast(t('create.errImage'))
  uploading.value = r.key
  try {
    r.image = (await upload(file)).url
  }
  catch (err) {
    toast(errorMessage(err, t('create.errUpload')))
  }
  finally {
    uploading.value = null
  }
}

function check() {
  const open = rewards.value.filter(r => !r.locked)
  if (!title.value.trim()) return t('create.errTitle')
  if (open.some(r => r.day < 1 || r.day > totalDays.value)) return t('create.errDay', { n: totalDays.value })
  if (open.some(r => r.day < firstOpenDay)) return t('edit.errFrom', { n: ticked, next: firstOpenDay })
  if (open.some(r => !r.title.trim())) return t('create.errName')
  return ''
}

async function submit() {
  error.value = check()
  if (error.value) return
  saving.value = true
  const list = [...rewards.value].sort((a, b) => a.day - b.day)
  const cheer = () => ({ icon: h(Germi, { pose: 'cheer', size: 28, class: 'text-on-indigo [--gm-bg:var(--m-indigo)]' }) })
  try {
    if (props.goal) {
      await updateGoal(props.goal.id, {
        title: title.value.trim(),
        icon: icon.value,
        totalDays: totalDays.value,
        remind: remind.value,
        rewards: list.map(({ id, day, title, icon, image }) => ({ id, day, title, icon, image })),
      })
      toast(t('edit.saved'), cheer())
      await navigateTo(`/goals/${props.goal.id}`)
      return
    }
    const goal = await create({
      title: title.value.trim(),
      icon: icon.value,
      totalDays: totalDays.value,
      startDate: startDate.value,
      remind: remind.value,
      rewards: list.map(({ day, title, icon, image }) => ({ day, title, icon, image })),
    })
    confettiBurst()
    toast(t('create.started', { n: goal.totalDays }), cheer())
    await navigateTo(`/goals/${goal.id}`)
  }
  catch (err) {
    error.value = errorMessage(err, t(editing.value ? 'edit.errSave' : 'create.errCreate'))
  }
  finally {
    saving.value = false
  }
}

const back = computed(() => (props.goal ? `/goals/${props.goal.id}` : '/'))
const chip = 'h-[38px] min-w-[38px] rounded-lg border border-line bg-surface px-2.5 text-indigo font-medium transition-colors disabled:opacity-35'
const chipOn = 'border-indigo bg-primary text-primary-foreground'
/** Picker / chip classes, swapping to the solid indigo state when `on`. */
const pick = (base: string, on: boolean) => cn(base, on && chipOn)
</script>

<template>
  <div>
    <div class="app-header sticky top-0 z-10 -mx-[22px] flex items-center justify-between bg-gradient-to-b from-background from-75% to-transparent px-[22px] pt-3.5 pb-2.5 md:top-0 md:-mx-7 md:px-7 max-[860px]:md:-mx-4 max-[860px]:md:px-4">
      <Button as-child variant="ghost" size="icon" class="app-header-btn text-indigo md:w-auto md:gap-1.5 md:pr-2.5 md:pl-1.5 md:text-[12.5px]" :aria-label="editing ? $t('edit.back') : $t('create.cancel')">
        <NuxtLink :to="back"><HandIcon name="arrow-left-01" /><span class="hidden md:inline">{{ editing ? $t('edit.back') : $t('common.allGoals') }}</span></NuxtLink>
      </Button>
      <Badge variant="solid" class="app-header-chip md:absolute md:left-1/2 md:-translate-x-1/2">{{ editing ? $t('edit.title') : $t('common.newGoal') }}</Badge>
      <span class="app-header-btn w-9" />
    </div>

    <div class="mx-auto max-w-[560px]">
      <div class="flex items-center justify-center gap-2.5 pt-1 pb-5">
        <Germi pose="gift" :size="60" />
        <TypographyLead v-if="editing">
          <span class="md:hidden">{{ $t('edit.lead1') }}<br>{{ $t('edit.lead2') }}</span>
          <span class="hidden md:inline">{{ $t('edit.leadWeb1') }}<br>{{ $t('edit.leadWeb2') }}</span>
        </TypographyLead>
        <TypographyLead v-else>{{ $t('create.lead1') }}<br>{{ $t('create.lead2') }}<span class="hidden md:inline"><br>{{ $t('create.lead3') }}</span></TypographyLead>
      </div>

      <form novalidate @submit.prevent="submit">
        <div class="mb-[22px]">
          <Label for="c-title" class="mb-2 block"><TypographyH3 as="span">{{ $t('create.what') }}</TypographyH3></Label>
          <Input id="c-title" v-model="title" :placeholder="$t('create.whatPh')" maxlength="80" />
        </div>

        <div class="mb-[22px]">
          <TypographyH3 class="mb-2">{{ $t('create.icon') }}</TypographyH3>
          <!-- fills the row: as many ≥40px squares as fit (7 on a phone), 24px icons -->
          <div class="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-1.5">
            <button
              v-for="ic in GOAL_ICONS"
              :key="ic"
              type="button"
              :class="pick('relative h-0 rounded-lg border border-line bg-surface pt-[calc(100%-2px)] text-indigo transition-colors', icon === ic)"
              :aria-pressed="icon === ic"
              :aria-label="ic"
              @click="icon = ic"
            >
              <!-- padding-box square: aspect-ratio grid items size unreliably in iOS WebKit -->
              <span class="absolute inset-0 grid place-items-center"><HandIcon :name="ic" class="size-6" /></span>
            </button>
          </div>
        </div>

        <div class="mb-[22px]">
          <TypographyH3 class="mb-2">{{ $t('create.howLong') }}</TypographyH3>
          <TypographyMuted v-if="editing && ticked > 0" class="-mt-1 mb-2.5">{{ $t('edit.minDays', { n: ticked, m: minDays }) }}</TypographyMuted>
          <div class="flex flex-wrap items-center gap-1.5">
            <button v-for="n in presets" :key="n" type="button" :class="pick(chip, totalDays === n)" :disabled="n < minDays" @click="setDays(n)">{{ n }}</button>
            <div class="ml-auto flex items-center gap-1.5">
              <button type="button" :class="chip" :aria-label="$t('create.minus')" :disabled="totalDays <= minDays" @click="setDays(totalDays - 1)"><HandIcon name="minus-sign" /></button>
              <output class="min-w-[42px] text-center text-[18px] font-semibold text-indigo tabular-nums">{{ totalDays }}</output>
              <button type="button" :class="chip" :aria-label="$t('create.plus')" @click="setDays(totalDays + 1)"><HandIcon name="add-01" /></button>
            </div>
          </div>
        </div>

        <!-- start date: new goals only for now (editing it waits on a decision) -->
        <div v-if="!editing" class="mb-[22px]">
          <Label for="c-start" class="mb-2 block"><TypographyH3 as="span">{{ $t('create.start') }}</TypographyH3></Label>
          <Input id="c-start" v-model="startDate" type="date" />
        </div>

        <div class="mb-[22px]">
          <TypographyH3 class="mb-2">{{ $t('remind.title') }}</TypographyH3>
          <TypographyMuted class="-mt-1 mb-2.5">{{ $t('remind.hint') }}</TypographyMuted>
          <RemindPicker v-model="remind" />
        </div>

        <div class="mb-[22px]">
          <TypographyH3 class="mb-2">{{ $t('create.rewards') }}</TypographyH3>
          <TypographyMuted class="-mt-1 mb-2.5">
            {{ $t('create.rewardsHint') }}<template v-if="rewards.some(r => r.locked)">{{ ' ' + $t('edit.lockedHint') }}</template>
          </TypographyMuted>

          <template v-for="r in rewards" :key="r.key">
            <!-- received: shown as it is, can't be changed or removed -->
            <div v-if="r.locked" class="mb-2 flex items-center gap-2 rounded-lg border border-dashed border-line px-1 py-1 opacity-75" :aria-label="$t('edit.received')">
              <span class="w-[54px] shrink-0 text-center text-sm text-indigo tabular-nums">{{ r.day }}</span>
              <span class="grid size-[42px] shrink-0 place-items-center overflow-hidden rounded-lg border border-line text-indigo"><RewardBadge :reward="r" /></span>
              <span class="min-w-0 flex-1 truncate px-1 text-[13px] text-ink">{{ r.title }}</span>
              <span class="grid size-9 shrink-0 place-items-center text-indigo" :title="$t('edit.received')"><HandIcon name="square-lock-02" /></span>
            </div>

            <template v-else>
              <div class="mb-2 flex items-center gap-2">
                <Input v-model.number="r.day" type="number" :min="firstOpenDay" :max="totalDays" class="w-[62px] shrink-0 px-1 text-center" :aria-label="$t('create.rewardDay')" />
                <button
                  type="button"
                  class="relative grid size-[42px] shrink-0 place-items-center rounded-lg border bg-surface text-indigo"
                  :class="pickerFor === r.key ? 'border-indigo' : 'border-line'"
                  :aria-label="$t('create.changePic')"
                  @click="pickerFor = pickerFor === r.key ? null : r.key"
                >
                  <span class="grid size-full place-items-center overflow-hidden rounded-[7px]"><RewardBadge :reward="r" /></span>
                  <span class="absolute -right-2 -bottom-2 grid size-7 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground">
                    <HandIcon name="camera-01" />
                  </span>
                </button>
                <Input v-model="r.title" :placeholder="$t('create.rewardPh')" class="min-w-0 flex-1" maxlength="60" :aria-label="$t('create.rewardName')" />
                <Button type="button" variant="ghost" size="icon" :aria-label="$t('create.removeMilestone')" @click="removeReward(r.key)">
                  <HandIcon name="cancel-01" />
                </Button>
              </div>

              <div v-if="pickerFor === r.key" class="-mt-0.5 mb-2.5 flex flex-col gap-2 rounded-lg border border-line bg-surface p-2.5" role="group" :aria-label="$t('create.picker')">
                <TypographyMuted as="span" class="text-[11.5px]">{{ $t('create.yourPhoto') }}</TypographyMuted>
                <div class="flex flex-wrap items-center gap-2">
                  <img v-if="r.image" :src="assetUrl(r.image)" :alt="$t('create.photoAlt')" class="size-14 rounded-xl border border-line object-cover">
                  <Button as="label" variant="outline" size="sm" class="h-11 cursor-pointer bg-background">
                    <HandIcon :name="uploading === r.key ? 'loading-03' : r.image ? 'camera-01' : 'image-add-01'" :class="[uploading === r.key && 'animate-spin']" />
                    {{ r.image ? $t('create.changePhoto') : $t('create.upload') }}
                    <input type="file" accept="image/*" class="sr-only" @change="onFile(r, $event)">
                  </Button>
                  <Button v-if="r.image" type="button" variant="outline" size="sm" class="h-11 text-muted-foreground" @click="r.image = null">
                    <HandIcon name="image-delete-02" /> {{ $t('create.removePhoto') }}
                  </Button>
                </div>
                <TypographyMuted as="span" class="text-[11.5px]">{{ $t('create.orIcon') }}</TypographyMuted>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="ic in REWARD_ICONS"
                    :key="ic"
                    type="button"
                    :class="pick('grid size-10 place-items-center rounded-lg border border-line bg-surface text-indigo', !r.image && r.icon === ic)"
                    :aria-label="ic"
                    @click="r.icon = ic; r.image = null; pickerFor = null"
                  >
                    <HandIcon :name="ic" />
                  </button>
                </div>
              </div>
            </template>
          </template>

          <Button type="button" variant="dashed" class="h-[42px] w-full" @click="addReward">{{ $t('create.addMilestone') }}</Button>

          <!-- reward track preview -->
          <div class="relative mx-1.5 mt-2 h-14" aria-hidden="true">
            <div class="absolute inset-x-0 top-[34px] h-2 rounded-full bg-faint" />
            <div
              v-for="r in track"
              :key="r.key"
              class="absolute top-0 flex -translate-x-1/2 flex-col items-center"
              :style="{ left: `${(r.day / totalDays) * 100}%` }"
            >
              <span class="grid size-8 place-items-center overflow-hidden rounded-full border border-line bg-surface text-indigo">
                <RewardBadge :reward="r" />
              </span>
              <TypographyMuted as="span" class="mt-3 text-[11px]">{{ r.day }}</TypographyMuted>
            </div>
          </div>
        </div>

        <TypographySmall v-if="error" as="p" class="mb-3 rounded-lg border border-indigo px-3 py-2.5 text-indigo" role="alert">{{ error }}</TypographySmall>

        <Button type="submit" size="lg" class="w-full" :disabled="saving">
          <template v-if="editing">{{ saving ? $t('edit.busy') : $t('edit.submit') }}</template>
          <template v-else>{{ saving ? $t('create.busy') : $t('create.submit') }}</template>
        </Button>
      </form>
    </div>
  </div>
</template>
