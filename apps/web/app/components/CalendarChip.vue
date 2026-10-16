<script setup lang="ts">
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { addDays, parseISODate, toISODate } from '#shared/utils/dates'

/**
 * Solid date chip with a caret that opens a month calendar popover
 * (Monday first, today outlined, selected filled, "back to today" link).
 * Used by the home garden and the day page. Extra sections (e.g. the
 * garden's month picker or a legend) go in the default slot.
 */
const props = defineProps<{
  label: string
  /** Latest pickable day (yyyy-mm-dd); later days and months are disabled. */
  max?: string
  /** Days that get a small dot under the number. */
  marked?: (iso: string) => boolean
}>()
const selected = defineModel<string>({ required: true })

const { locale } = useI18n()
const today = toISODate()
const open = ref(false)
const anchor = ref<HTMLElement>()
const calMonth = ref(selected.value.slice(0, 7)) // yyyy-mm shown in the calendar
onClickOutside(anchor, () => (open.value = false))
onKeyStroke('Escape', () => (open.value = false))

function toggle() {
  open.value = !open.value
  calMonth.value = selected.value.slice(0, 7)
}
function shiftMonth(n: number) {
  const [y, m] = calMonth.value.split('-').map(Number)
  calMonth.value = toISODate(new Date(y!, m! - 1 + n, 1)).slice(0, 7)
}
function pick(iso: string) {
  selected.value = iso
  open.value = false
}

const nextDisabled = computed(() => !!props.max && calMonth.value >= props.max.slice(0, 7))
const calTitle = computed(() => {
  const s = parseISODate(`${calMonth.value}-01`).toLocaleDateString(locale.value === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
})
const calDays = computed(() => {
  const first = parseISODate(`${calMonth.value}-01`)
  const lead = (first.getDay() + 6) % 7 // Monday first
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  return {
    lead,
    days: Array.from({ length: count }, (_, i) => {
      const iso = addDays(`${calMonth.value}-01`, i)
      return { iso, n: i + 1, isToday: iso === today, on: iso === selected.value, disabled: !!props.max && iso > props.max, dot: props.marked?.(iso) ?? false }
    }),
  }
})

defineExpose({ close: () => (open.value = false) })
</script>

<template>
  <div ref="anchor" class="relative z-[15] flex justify-center">
    <Badge
      as="button"
      type="button"
      variant="solid"
      class="cursor-pointer gap-1.5"
      :aria-expanded="open"
      aria-haspopup="dialog"
      @click="toggle"
    >
      {{ label }}
      <i class="size-1.5 border-r-[1.5px] border-b-[1.5px] border-current transition-transform duration-150" :class="open ? 'translate-y-px -rotate-[135deg]' : '-translate-y-0.5 rotate-45'" />
    </Badge>

    <div
      v-if="open"
      class="absolute top-[calc(100%+8px)] left-1/2 flex w-64 -translate-x-1/2 flex-col gap-2 rounded-xl border border-line bg-surface p-3 shadow-[0_14px_30px_-14px_rgba(0,0,0,.35)] animate-in fade-in-0 zoom-in-95"
      role="dialog"
      :aria-label="$t('forest.pickDate')"
    >
      <div class="flex items-center justify-between text-[12.5px] text-indigo">
        <Button type="button" variant="ghost" size="icon-sm" :aria-label="$t('forest.prevMonth')" @click="shiftMonth(-1)"><HandIcon name="arrow-left-01" /></Button>
        <b class="font-semibold">{{ calTitle }}</b>
        <Button type="button" variant="ghost" size="icon-sm" :disabled="nextDisabled" :aria-label="$t('forest.nextMonth')" @click="shiftMonth(1)"><HandIcon name="arrow-left-01" class="-scale-x-100" /></Button>
      </div>
      <div class="grid grid-cols-7 gap-0.5 text-center">
        <span v-for="i in 7" :key="i" class="text-[9.5px] text-muted-foreground">{{ $t(`forest.weekdaysShort.${i - 1}`) }}</span>
      </div>
      <div class="grid grid-cols-7 gap-0.5 text-center">
        <span v-for="i in calDays.lead" :key="`l${i}`" />
        <button
          v-for="d in calDays.days"
          :key="d.iso"
          type="button"
          class="relative h-7 rounded-[7px] text-[11.5px] text-ink hover:bg-background disabled:pointer-events-none disabled:opacity-30"
          :class="[d.isToday && 'font-semibold text-indigo shadow-[inset_0_0_0_1px_var(--m-indigo)]', d.on && 'bg-primary text-primary-foreground hover:bg-primary']"
          :disabled="d.disabled"
          :aria-label="dotDate(d.iso)"
          :aria-pressed="d.on"
          @click="pick(d.iso)"
        >
          {{ d.n }}
          <i v-if="d.dot" class="absolute bottom-[3px] left-1/2 size-[3px] -translate-x-1/2 rounded-full" :class="d.on ? 'bg-primary-foreground' : 'bg-indigo'" />
        </button>
      </div>
      <slot />
      <Button type="button" variant="link" size="xs" class="self-center text-[11px]" @click="pick(today)">{{ $t('forest.backToday') }}</Button>
    </div>
  </div>
</template>
