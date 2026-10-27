<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { Goal } from '#shared/types'

/**
 * "Giờ nhắc" section of a goal (v60), right under its rewards: the goal's own
 * daily reminder time and a note on when it fires (the notification
 * preview card was dropped in v67).
 */
const props = defineProps<{ goal: Goal }>()
const { t } = useI18n()
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
  </section>
</template>
