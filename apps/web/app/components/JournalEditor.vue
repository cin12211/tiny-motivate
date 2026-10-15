<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'

/**
 * Borderless rich-text journal for one day (TipTap). v-model is HTML.
 * Slots: `between` (under the text, e.g. the mood picker) and `actions`
 * (right side of the footer, next to the formatting toolbar).
 */
const props = withDefaults(defineProps<{ placeholder?: string, label?: string }>(), {
  placeholder: 'ghi lại một chút về hôm nay...',
  label: 'Nhật ký',
})
const html = defineModel<string>({ default: '' })

const editor = useEditor({
  content: html.value,
  immediatelyRender: false,
  extensions: [
    StarterKit.configure({ heading: false, link: false }),
    Highlight,
    Placeholder.configure({ placeholder: () => props.placeholder }),
  ],
  editorProps: { attributes: { 'class': 'journal-prose', 'aria-label': props.label } },
  onUpdate: ({ editor }) => {
    html.value = editor.isEmpty ? '' : editor.getHTML()
  },
})

watch(html, (v) => {
  const e = editor.value
  if (e && v !== (e.isEmpty ? '' : e.getHTML())) e.commands.setContent(v || '', { emitUpdate: false })
})
onBeforeUnmount(() => editor.value?.destroy())

const tools = computed(() => {
  const e = editor.value
  return [
    { icon: 'text-bold', label: 'In đậm', active: e?.isActive('bold'), run: () => e?.chain().focus().toggleBold().run() },
    { icon: 'text-italic', label: 'In nghiêng', active: e?.isActive('italic'), run: () => e?.chain().focus().toggleItalic().run() },
    { icon: 'text-underline', label: 'Gạch chân', active: e?.isActive('underline'), run: () => e?.chain().focus().toggleUnderline().run() },
    { icon: 'left-to-right-list-bullet', label: 'Danh sách', active: e?.isActive('bulletList'), run: () => e?.chain().focus().toggleBulletList().run() },
  ]
})
</script>

<template>
  <div class="flex min-h-[230px] flex-col px-1.5 pt-7 pb-2">
    <EditorContent :editor="editor" class="min-h-[150px] flex-1" />
    <slot name="between" />
    <div class="mt-3.5 flex items-center justify-between gap-2.5">
      <div class="flex gap-0.5" role="toolbar" aria-label="Định dạng">
        <Button
          v-for="t in tools"
          :key="t.icon"
          type="button"
          variant="ghost"
          size="icon-sm"
          :class="t.active && 'bg-surface text-indigo'"
          :aria-label="t.label"
          :aria-pressed="!!t.active"
          :title="t.label"
          @click="t.run"
        >
          <Icon :name="`hugeicons:${t.icon}`" />
        </Button>
      </div>
      <slot name="actions" />
    </div>
  </div>
</template>
