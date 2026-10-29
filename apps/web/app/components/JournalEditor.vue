<script setup lang="ts">
/**
 * Borderless plain-text journal for one day (v73): a textarea that grows with
 * its text, Enter makes a new line. v-model is plain text; entries saved as
 * HTML by the old rich-text editor are shown as text (journalText).
 * Slots: `between` (under the text, e.g. the mood picker) and `actions`
 * (footer, right aligned).
 */
const props = defineProps<{ placeholder?: string, label?: string }>()
const text = defineModel<string>({ default: '' })

const area = ref<HTMLTextAreaElement>()
const value = computed({
  get: () => journalText(text.value),
  set: (v: string) => (text.value = v),
})

function grow() {
  const el = area.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}
onMounted(grow)
watch(value, () => nextTick(grow))
</script>

<template>
  <div class="flex min-h-[230px] flex-col px-1.5 pt-7 pb-2 md:min-h-0 md:pt-3.5">
    <textarea
      ref="area"
      v-model="value"
      rows="1"
      :placeholder="props.placeholder ?? $t('journal.placeholder')"
      :aria-label="props.label ?? $t('journal.label')"
      class="min-h-[150px] w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-[14.5px] leading-[1.55] text-indigo outline-none placeholder:text-muted-foreground md:min-h-24"
    />
    <slot name="between" />
    <div class="mt-3.5 flex items-center justify-end gap-2.5 md:mt-2">
      <slot name="actions" />
    </div>
  </div>
</template>
