<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'

/**
 * Borderless rich-text journal for one day (TipTap). v-model is HTML.
 * The B / I / U / list toolbar sits right under the text and only shows while
 * writing; its 38px row is always reserved so nothing jumps when it appears.
 * Slots: `between` (under the toolbar, e.g. the mood picker) and `actions`
 * (footer, right aligned).
 */
const { t } = useI18n()
const props = defineProps<{ placeholder?: string, label?: string }>()
const html = defineModel<string>({ default: '' })

// focus state from TipTap instead of a :has(.ProseMirror:focus) selector,
// which the browser re-checks on every keystroke
const focused = ref(false)
// last HTML sent up, so the echo coming back through v-model isn't serialised again
let emitted = html.value

const editor = useEditor({
  content: html.value,
  immediatelyRender: false,
  extensions: [
    StarterKit.configure({ heading: false, link: false }),
    Highlight,
    Placeholder.configure({ placeholder: () => props.placeholder ?? t('journal.placeholder') }),
  ],
  editorProps: { attributes: { 'class': 'journal-prose', 'aria-label': props.label ?? t('journal.label') } },
  onUpdate: ({ editor }) => {
    emitted = editor.isEmpty ? '' : editor.getHTML()
    html.value = emitted
  },
  onFocus: () => (focused.value = true),
  onBlur: () => (focused.value = false),
})

watch(html, (v) => {
  const e = editor.value
  if (!e || v === emitted) return
  emitted = v
  e.commands.setContent(v || '', { emitUpdate: false })
})
onBeforeUnmount(() => editor.value?.destroy())

const tools = computed(() => {
  const e = editor.value
  return [
    { icon: 'text-bold', label: t('journal.bold'), active: e?.isActive('bold'), run: () => e?.chain().focus().toggleBold().run() },
    { icon: 'text-italic', label: t('journal.italic'), active: e?.isActive('italic'), run: () => e?.chain().focus().toggleItalic().run() },
    { icon: 'text-underline', label: t('journal.underline'), active: e?.isActive('underline'), run: () => e?.chain().focus().toggleUnderline().run() },
    { icon: 'left-to-right-list-bullet', label: t('journal.list'), active: e?.isActive('bulletList'), run: () => e?.chain().focus().toggleBulletList().run() },
  ]
})
</script>

<template>
  <div class="group/journal flex min-h-[230px] flex-col px-1.5 pt-7 pb-2 md:min-h-0 md:pt-3.5">
    <EditorContent :editor="editor" class="min-h-[150px] flex-1 md:min-h-24" />
    <div
      class="mt-2.5 -ml-[3px] flex h-[38px] w-fit gap-0.5 rounded-[9px] border border-line bg-surface p-[3px] opacity-0 transition-[opacity,transform,visibility] delay-[0s,0s,150ms] duration-150 motion-reduce:transition-none"
      :class="focused ? 'visible translate-y-0 opacity-100 delay-0' : 'invisible translate-y-[-4px]'"
      role="toolbar"
      :aria-label="$t('journal.format')"
    >
      <Button
        v-for="t in tools"
        :key="t.icon"
        type="button"
        variant="ghost"
        size="icon-sm"
        class="text-indigo hover:bg-background"
        :class="t.active && 'bg-background'"
        :aria-label="t.label"
        :aria-pressed="!!t.active"
        :title="t.label"
        @mousedown.prevent
        @click="t.run"
      >
        <HandIcon :name="t.icon" />
      </Button>
    </div>
    <slot name="between" />
    <div class="mt-3.5 flex items-center justify-end gap-2.5 md:mt-2">
      <slot name="actions" />
    </div>
  </div>
</template>
