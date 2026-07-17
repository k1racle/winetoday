<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { stripTextColor } from '~/utils/html-sanitize';
import { FontSize } from '~/utils/tiptap-font-size';
import { Video } from '~/utils/tiptap-video';

const props = defineProps<{
  modelValue?: any;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();

const editor = useEditor({
  content: stripTextColor(props.modelValue || '<p></p>'),
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
    TextAlign.configure({ types: ['paragraph', 'heading'] }),
    FontSize,
    Video,
  ],
  editorProps: {
    attributes: {
      class: 'min-h-[200px] px-3 py-2 text-sm leading-relaxed outline-none prose prose-sm max-w-none text-foreground dark:prose-invert',
    },
    transformPastedHTML(html) {
      return stripTextColor(html);
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', stripTextColor(editor.getHTML()));
  },
});

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return;
    const current = editor.value.getHTML();
    const cleanValue = stripTextColor(value || '<p></p>');
    if (current !== cleanValue) {
      editor.value.commands.setContent(cleanValue, false);
    }
  },
);

function insertVideo() {
  if (!editor.value) return;
  const url = window.prompt('Вставьте ссылку на видео (YouTube, Rutube и т.д.)');
  if (!url) return;
  editor.value.chain().focus().setVideo({ src: url }).run();
}

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

function setFontSize(event: Event) {
  if (!editor.value) return;
  const target = event.target as HTMLSelectElement;
  const size = target.value;
  if (!size) {
    editor.value.chain().focus().unsetFontSize().run();
  } else {
    editor.value.chain().focus().setFontSize(`${size}px`).run();
  }
}

function currentFontSize() {
  if (!editor.value) return '';
  const size = editor.value.getAttributes('fontSize').size as string | undefined;
  if (!size) return '';
  return size.replace('px', '');
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
        class="px-2 py-1 text-xs font-normal rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      >
        Ж
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-normal rounded hover:bg-foreground/10 italic"
        :class="{ 'bg-foreground/20': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        К
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-normal rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-normal rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive('heading', { level: 3 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>

      <span class="mx-1 h-4 w-px bg-foreground/20" />

      <button
        type="button"
        class="px-2 py-1 text-xs font-normal rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        • Список
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-normal rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        1. Список
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-normal rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive('blockquote') }"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        Цитата
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-normal rounded hover:bg-foreground/10"
        @click="insertVideo"
      >
        Видео
      </button>

      <span class="mx-1 h-4 w-px bg-foreground/20" />

      <button
        type="button"
        class="px-2 py-1 text-xs font-normal rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive({ textAlign: 'left' }) }"
        @click="editor.chain().focus().setTextAlign('left').run()"
      >
        ←
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-normal rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive({ textAlign: 'center' }) }"
        @click="editor.chain().focus().setTextAlign('center').run()"
      >
        ↔
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-normal rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive({ textAlign: 'right' }) }"
        @click="editor.chain().focus().setTextAlign('right').run()"
      >
        →
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs font-normal rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive({ textAlign: 'justify' }) }"
        @click="editor.chain().focus().setTextAlign('justify').run()"
      >
        ⇹
      </button>

      <span class="mx-1 h-4 w-px bg-foreground/20" />

      <select
        :value="currentFontSize()"
        class="h-6 px-1 text-xs bg-transparent border border-foreground/20 rounded"
        @change="setFontSize"
      >
        <option value="">Размер</option>
        <option value="12">12px</option>
        <option value="14">14px</option>
        <option value="16">16px</option>
        <option value="18">18px</option>
        <option value="20">20px</option>
        <option value="24">24px</option>
        <option value="30">30px</option>
      </select>

      <span class="mx-1 h-4 w-px bg-foreground/20" />

      <button
        type="button"
        class="px-2 py-1 text-xs font-normal rounded hover:bg-foreground/10"
        :class="{ 'bg-foreground/20': editor.isActive('link') }"
        @click="setLink"
      >
        Ссылка
      </button>

    </div>
    <EditorContent :editor="editor" />
  </div>
</template>
