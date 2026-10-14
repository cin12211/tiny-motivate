<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'

/** Rich-text journal for one day (TipTap). v-model is HTML. */
const props = withDefaults(defineProps<{ editable?: boolean, placeholder?: string }>(), {
  editable: true,
  placeholder: 'Hôm nay bạn đã làm được gì?',
})
const html = defineModel<string>({ default: '' })

const editor = useEditor({
  content: html.value,
  editable: props.editable,
  immediatelyRender: false,
  extensions: [
    StarterKit.configure({ heading: { levels: [3] } }),
    Highlight,
    Placeholder.configure({ placeholder: () => props.placeholder }),
  ],
  editorProps: { attributes: { class: 'journal-prose', 'aria-label': 'Nhật ký' } },
  onUpdate: ({ editor }) => {
    html.value = editor.isEmpty ? '' : editor.getHTML()
  },
})

watch(html, (v) => {
  const e = editor.value
  if (e && v !== (e.isEmpty ? '' : e.getHTML())) e.commands.setContent(v || '', { emitUpdate: false })
})
watch(() => props.editable, v => editor.value?.setEditable(v))
onBeforeUnmount(() => editor.value?.destroy())

const tools = computed(() => {
  const e = editor.value
  return [
    { icon: 'text-bold', label: 'In đậm', active: e?.isActive('bold'), run: () => e?.chain().focus().toggleBold().run() },
    { icon: 'text-italic', label: 'In nghiêng', active: e?.isActive('italic'), run: () => e?.chain().focus().toggleItalic().run() },
    { icon: 'highlighter', label: 'Tô sáng', active: e?.isActive('highlight'), run: () => e?.chain().focus().toggleHighlight().run() },
    'sep',
    { icon: 'left-to-right-list-bullet', label: 'Danh sách', active: e?.isActive('bulletList'), run: () => e?.chain().focus().toggleBulletList().run() },
    { icon: 'left-to-right-list-number', label: 'Danh sách số', active: e?.isActive('orderedList'), run: () => e?.chain().focus().toggleOrderedList().run() },
    { icon: 'quote-down', label: 'Trích dẫn', active: e?.isActive('blockquote'), run: () => e?.chain().focus().toggleBlockquote().run() },
  ] as const
})
</script>

<template>
  <div class="overflow-hidden rounded-2xl border-2 border-line" :class="!editable && 'opacity-70'">
    <div class="flex flex-wrap gap-1 border-b-2 border-line bg-field p-1.5" role="toolbar" aria-label="Định dạng">
      <template v-for="(t, i) in tools" :key="i">
        <span v-if="t === 'sep'" class="mx-0.5 my-1 w-0.5 bg-line" />
        <button
          v-else
          type="button"
          class="grid h-8 min-w-9 place-items-center rounded-lg px-2 text-muted-foreground transition-colors hover:bg-surface disabled:opacity-50"
          :class="t.active && 'bg-sky-soft text-sky hover:bg-sky-soft'"
          :disabled="!editable"
          :aria-label="t.label"
          :aria-pressed="!!t.active"
          :title="t.label"
          @click="t.run"
        >
          <Icon :name="`hugeicons:${t.icon}`" class="size-[18px]" />
        </button>
      </template>
    </div>
    <EditorContent :editor="editor" class="bg-surface" />
  </div>
</template>
