"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { tiptapExtensions } from "@/lib/tiptap";
import type { EditorHtmlEditorBlock } from "./types";

const toolbarButtonClass =
  "flex h-7 w-7 items-center justify-center rounded text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700";

const toolbarSelectClass =
  "h-7 rounded border border-black/10 bg-white px-1.5 text-xs text-zinc-700 outline-none dark:border-white/10 dark:bg-[#141414] dark:text-zinc-200";

type HtmlEditorBlockProps = {
  block: EditorHtmlEditorBlock;
  onChange: (block: EditorHtmlEditorBlock) => void;
};

export function HtmlEditorBlock({ block, onChange }: HtmlEditorBlockProps) {
  const editor = useEditor({
    extensions: tiptapExtensions,
    content: block.content,
    onUpdate: ({ editor: updatedEditor }) => {
      onChange({ ...block, content: updatedEditor.getJSON() });
    },
  });

  if (!editor) {
    return <div className="min-h-[140px] rounded border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-[#141414]">Загрузка редактора...</div>;
  }

  return (
    <div className="rounded border border-black/10 bg-white dark:border-white/10 dark:bg-[#141414]">
      <div className="flex flex-wrap items-center gap-1 border-b border-black/10 bg-[#eeeeee] p-1.5 dark:border-white/10 dark:bg-[#2a2a2a]">
        <select
          value={editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : "p"}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "h2") {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            } else if (value === "h3") {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            } else {
              editor.chain().focus().setParagraph().run();
            }
          }}
          className={toolbarSelectClass}
        >
          <option value="p">Абзац</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
        </select>
        <span className="mx-1 h-4 w-px bg-black/10 dark:bg-white/10" />
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`${toolbarButtonClass} ${editor.isActive("bold") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}><b>Ж</b></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${toolbarButtonClass} ${editor.isActive("italic") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}><i>К</i></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${toolbarButtonClass} ${editor.isActive("underline") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}><u>Ч</u></button>
        <span className="mx-1 h-4 w-px bg-black/10 dark:bg-white/10" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${toolbarButtonClass} ${editor.isActive("bulletList") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}>≡</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${toolbarButtonClass} ${editor.isActive("orderedList") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}>1.</button>
        <button type="button" onClick={() => {
          const url = window.prompt("URL ссылки");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }} className={`${toolbarButtonClass} ${editor.isActive("link") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}>🔗</button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[140px] p-3 text-sm leading-relaxed outline-none prose prose-sm max-w-none dark:prose-invert"
      />
    </div>
  );
}
