<script setup lang="ts">
import { UI_CLOCK } from '@motivation/garden'
import { cn } from '@/lib/utils'

/**
 * Goal reminder time (v60): "no reminder", 07:00 / 12:00 / 20:00 or any other
 * time. The time input only shows a value for a free time; its native picker
 * icon is replaced by the hand-drawn alarm clock (v60c) while the invisible
 * indicator still covers the input, so a tap anywhere opens the picker.
 */
const remind = defineModel<string | null>({ default: null })
const PRESETS = ['07:00', '12:00', '20:00']
const custom = computed(() => (remind.value && !PRESETS.includes(remind.value) ? remind.value : ''))

const chip = 'h-[38px] rounded-lg border border-line bg-surface px-2.5 text-[13px] font-medium text-indigo transition-colors'
const chipOn = 'border-indigo bg-primary text-primary-foreground'

function onTime(e: Event) {
  const v = (e.target as HTMLInputElement).value
  if (/^\d{2}:\d{2}$/.test(v)) remind.value = v
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5">
    <button type="button" :class="cn(chip, !remind && chipOn)" :aria-pressed="!remind" @click="remind = null">{{ $t('remind.off') }}</button>
    <button v-for="p in PRESETS" :key="p" type="button" :class="cn(chip, 'tabular-nums', remind === p && chipOn)" :aria-pressed="remind === p" @click="remind = p">{{ p }}</button>
    <!-- the label draws the box; the input fills it absolutely, because iOS WebKit
         sizes a time input to its text and ignores width: 100% -->
    <label class="relative h-[38px] min-w-[108px] flex-1 rounded-lg border bg-surface" :class="custom ? 'border-indigo' : 'border-line'">
      <input
        type="time"
        :value="custom"
        :aria-label="$t('remind.other')"
        class="remind-time absolute inset-0 size-full min-w-0 appearance-none rounded-lg bg-transparent pr-9 pl-2.5 text-left text-[13px] font-medium tabular-nums outline-none"
        :class="custom ? 'text-indigo' : 'text-transparent'"
        @change="onTime"
      >
      <!-- empty: a hint instead of the browser's "--:--" (iOS shows nothing at all) -->
      <span v-if="!custom" class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[13px] text-muted-foreground">{{ $t('remind.otherShort') }}</span>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <svg :viewBox="UI_CLOCK.viewBox" aria-hidden="true" class="pointer-events-none absolute top-1/2 right-2.5 size-[22px] -translate-y-1/2 text-indigo" v-html="UI_CLOCK.body" />
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
.remind-time {
  -webkit-appearance: none;
}
.remind-time::-webkit-date-and-time-value {
  text-align: left;
  min-height: 1.2em;
}
</style>
