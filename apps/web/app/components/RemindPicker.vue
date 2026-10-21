<script setup lang="ts">
import { UI_CLOCK } from '@motivation/garden'
import { cn } from '@/lib/utils'

/**
 * Goal reminder time (v60): "no reminder", 07:00 / 12:00 / 20:00 or any other
 * time. The time input only shows a value for a free time and sits in the chip
 * row sized to its value; its native picker icon is replaced by the
 * hand-drawn alarm clock (v60c) while the invisible indicator still covers
 * the input, so a tap anywhere opens the picker.
 */
const remind = defineModel<string | null>({ default: null })
const PRESETS = ['07:00', '12:00', '20:00']
const custom = computed(() => (remind.value && !PRESETS.includes(remind.value) ? remind.value : ''))

const chip = 'h-9 rounded-lg border border-line bg-surface px-3 text-[12.5px] font-medium text-indigo transition-colors'
const chipOn = 'border-indigo bg-primary text-primary-foreground'

function onTime(e: Event) {
  const v = (e.target as HTMLInputElement).value
  if (/^\d{2}:\d{2}$/.test(v)) remind.value = v
}
</script>

<template>
  <!-- design v60 / v60c: 36px chips, then the time box as one more chip, sized to its value -->
  <div class="flex flex-wrap items-center gap-2">
    <button type="button" :class="cn(chip, !remind && chipOn)" :aria-pressed="!remind" @click="remind = null">{{ $t('remind.off') }}</button>
    <button v-for="p in PRESETS" :key="p" type="button" :class="cn(chip, 'tabular-nums', remind === p && chipOn)" :aria-pressed="remind === p" @click="remind = p">{{ p }}</button>
    <label class="relative inline-flex">
      <input
        type="time"
        :value="custom"
        :aria-label="$t('remind.other')"
        class="remind-time relative h-9 w-auto min-w-[104px] rounded-[7px] border bg-surface pr-9 pl-2.5 text-[12.5px] font-medium text-indigo tabular-nums outline-none"
        :class="custom ? 'border-indigo shadow-[inset_0_0_0_1px_var(--m-indigo)]' : 'border-line'"
        @change="onTime"
      >
      <!-- eslint-disable-next-line vue/no-v-html -->
      <svg :viewBox="UI_CLOCK.viewBox" aria-hidden="true" class="pointer-events-none absolute top-1/2 right-2 size-[22px] -translate-y-1/2 text-indigo" v-html="UI_CLOCK.body" />
    </label>
  </div>
</template>

<style scoped>
/* native clock icon: invisible but stretched over the whole input, so tapping anywhere opens the picker */
.remind-time::-webkit-calendar-picker-indicator {
  position: absolute;
  inset: 0;
  width: auto;
  height: auto;
  opacity: 0;
  cursor: pointer;
}
.remind-time::-webkit-date-and-time-value {
  text-align: left;
  min-height: 1.2em;
}
</style>
