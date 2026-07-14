<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';

const props = defineProps<{
  modelValue?: any;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();

const editor = useEditor({
  content: props.modelValue || '<p></p>',
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      codeBlock: false,
      horizontalRule: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-accent underline hover:no-underline' },
    }),
    TextStyle,
    Color.configure({ types: ['textStyle'] }),
  ],
  editorProps: {
    attributes: {
      class: 'min-h-[200px] px-3 py-2 text-sm leading-relaxed outline-none prose prose-sm max-w-none text-foreground',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML());
  },
});

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return;
    const current = editor.value.getHTML();
    if (current !== (value || '<p></p>')) {
      editor.value.commands.setContent(value || '<p></p>', false);
    }
  },
);

function setLink() {
  if (!editor.value) return;
  const previousUrl = editor.value.getAttributes('link').href;
  const url = window.prompt('URL', previousUrl);
  if (url === null) return;
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
  } else {
    editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }
}

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<template>
  <div v-if="editor" class="rounded border border-foreground/10 bg-card">
    <div class="flex flex-wrap items-center gap-1 border-b border-foreground/10 px-2 py-1">
      <button
        type="button"
        class="px-2 py-1 text-xs font-medium rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      >
        Ж
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-medium rounded hover:bg-foreground/10 italic"
        :class="{ 'bg-foreground/20': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        К
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-medium rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-medium rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive('heading', { level: 3 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-medium rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        • Список
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-medium rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        1. Список
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-medium rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive('link') }"
        @click="setLink"
      >
        Ссылка
      </button>
      <input
        type="color"
        class="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
        :value="editor.getAttributes('textStyle').color || '#000000'"
        @input="editor.chain().focus().setColor(($event.target as HTMLInputElement).value).run()"
      >
      <button
        type="button"
        class="px-2 py-1 text-xs font-medium rounded hover:bg-foreground/10"
        @click="editor.chain().focus().unsetColor().run()"
      >
        Сбросить цвет
      </button>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>
