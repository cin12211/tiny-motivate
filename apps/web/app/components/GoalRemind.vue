<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { Goal } from '#shared/types'

/**
 * "Giờ nhắc" section of a goal (v60), right under its rewards: the goal's own
 * daily reminder time, a note on when it fires, and a preview of the
 * notification when it has its own time.
 */
const props = defineProps<{ goal: Goal }>()
const { t, locale } = useI18n()
const { updateGoal } = useGoals()
const { settings } = useSettings()

const s = computed(() => goalStats(props.goal))
const same = computed(() => sameAsGeneral(props.goal, settings.value))
const daysLeft = computed(() => Math.max(0, props.goal.totalDays - Math.max(1, s.value.today) + 1))

const remind = computed({
  get: () => props.goal.remind,
  set: (value: string | null) => {
    if (value === props.goal.remind) return
    const title = props.goal.title
    updateGoal(props.goal.id, { remind: value }).catch(err => toast(errorMessage(err, t('remind.errSave'))))
    toast(!value
      ? t('remind.toastOff')
      : sameAsGeneral({ remind: value }, settings.value)
        ? t('remind.toastSame', { time: value })
        : t('remind.toastOn', { title, time: value }))
  },
})

// notification preview: one of the approved lines, "see another" picks the next
const pick = ref(Math.floor(Math.random() * 4))
const preview = computed(() => goalReminderBody(props.goal, locale.value, Math.max(1, s.value.today), pick.value))
</script>

<template>
  <section class="flex flex-col items-center gap-2.5 pt-[26px] pb-[30px] md:pt-3">
    <Badge class="mb-1">{{ $t('remind.title') }}</Badge>
    <RemindPicker v-model="remind" class="justify-center" />
    <TypographyMuted class="max-w-[320px] text-center text-xs leading-normal">
      <template v-if="!goal.remind">{{ $t('remind.noteOff') }}</template>
      <template v-else-if="same">{{ $t('remind.noteSame', { time: goal.remind }) }}</template>
      <template v-else>
        {{ $t('remind.noteOn', { time: goal.remind, n: daysLeft }) }}
        <template v-if="s.todayDone"> {{ $t('remind.noteTicked') }}</template>
      </template>
    </TypographyMuted>

    <!-- preview of the notification (only when the goal has its own time) -->
    <div v-if="goal.remind && !same" class="flex w-full max-w-[340px] flex-col items-center gap-2.5">
      <div class="flex w-full items-start gap-2.5 rounded-2xl border border-line bg-surface px-3 py-[11px] shadow-[0_10px_24px_-16px_rgba(20,10,80,.45)]">
        <LogoTile :size="34" />
        <div class="min-w-0 flex-1">
          <div class="flex items-baseline justify-between gap-2">
            <b class="text-[12.5px] font-semibold text-indigo">{{ goalReminderTitle(locale) }}</b>
            <TypographyMuted as="small" class="shrink-0 text-[10.5px] tabular-nums">{{ goal.remind }}</TypographyMuted>
          </div>
          <TypographySmall as="p" class="mt-0.5 leading-snug text-indigo">{{ preview }}</TypographySmall>
        </div>
      </div>
      <button type="button" class="text-xs text-indigo underline underline-offset-[3px]" @click="pick++">{{ $t('remind.another') }}</button>
    </div>
  </section>
</template>
