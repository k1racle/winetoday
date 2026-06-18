"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { createEmptyTiptapDocument, parseTiptapDocument, tiptapExtensions } from "@/lib/tiptap";
import type { EditorHtmlEditorBlock } from "./types";

const toolbarButtonClass =
  "flex h-7 w-7 items-center justify-center rounded text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700";

const toolbarSelectClass =
  "h-7 rounded border border-black/10 bg-white px-1.5 text-xs text-zinc-700 outline-none dark:border-white/10 dark:bg-[#141414] dark:text-zinc-200";

const inputClassName =
  "w-full rounded border-0 bg-transparent px-2 py-1.5 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-0 dark:text-zinc-100";

type HtmlEditorBlockProps = {
  block: EditorHtmlEditorBlock;
  onChange: (block: EditorHtmlEditorBlock) => void;
};

function AlignLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function AlignCenterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="6" x2="18" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="6" y1="18" x2="18" y2="18" />
    </svg>
  );
}

function AlignRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="9" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function AlignJustifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function BlockquoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z" />
    </svg>
  );
}

function HrIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  );
}

export function HtmlEditorBlock({ block, onChange }: HtmlEditorBlockProps) {
  const editor = useEditor({
    extensions: tiptapExtensions,
    content: typeof block.content === "string" ? parseTiptapDocument(block.content) ?? createEmptyTiptapDocument() : block.content,
    onUpdate: ({ editor: updatedEditor }) => {
      onChange({ ...block, content: updatedEditor.getJSON() });
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    const nextContent = typeof block.content === "string" ? parseTiptapDocument(block.content) ?? createEmptyTiptapDocument() : block.content;
    const currentContent = editor.getJSON();

    if (JSON.stringify(currentContent) !== JSON.stringify(nextContent)) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }
  }, [block.content, editor]);

  if (!editor) {
    return <div className="min-h-[140px] rounded border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-[#141414]">Загрузка редактора...</div>;
  }

  const blockTypeValue = editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
      ? "h3"
      : editor.isActive("heading", { level: 4 })
        ? "h4"
        : "p";

  function setBlockType(value: string) {
    if (value === "h2") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (value === "h3") {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    } else if (value === "h4") {
      editor.chain().focus().toggleHeading({ level: 4 }).run();
    } else {
      editor.chain().focus().setParagraph().run();
    }
  }

  return (
    <div className="rounded border border-black/10 bg-white dark:border-white/10 dark:bg-[#141414]">
      <div className="border-b border-black/10 bg-[#f5f5f5] p-2 dark:border-white/10 dark:bg-[#1e1e1e]">
        <input
          type="text"
          value={block.title ?? ""}
          onChange={(event) => onChange({ ...block, title: event.target.value })}
          placeholder="Заголовок блока (необязательно)"
          className={inputClassName}
        />
      </div>
      <div className="flex flex-wrap items-center gap-1 border-b border-black/10 bg-[#eeeeee] p-1.5 dark:border-white/10 dark:bg-[#2a2a2a]">
        <select value={blockTypeValue} onChange={(event) => setBlockType(event.target.value)} className={toolbarSelectClass}>
          <option value="p">Абзац</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
        </select>

        <span className="mx-1 h-4 w-px bg-black/10 dark:bg-white/10" />

        <button type="button" title="Жирный" onClick={() => editor.chain().focus().toggleBold().run()} className={`${toolbarButtonClass} ${editor.isActive("bold") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}><b>Ж</b></button>
        <button type="button" title="Курсив" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${toolbarButtonClass} ${editor.isActive("italic") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}><i>К</i></button>
        <button type="button" title="Подчёркнутый" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${toolbarButtonClass} ${editor.isActive("underline") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}><u>Ч</u></button>
        <button type="button" title="Зачёркнутый" onClick={() => editor.chain().focus().toggleStrike().run()} className={`${toolbarButtonClass} ${editor.isActive("strike") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}><s>S</s></button>
        <button type="button" title="Код" onClick={() => editor.chain().focus().toggleCode().run()} className={`${toolbarButtonClass} ${editor.isActive("code") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}>{">{"}</button>

        <span className="mx-1 h-4 w-px bg-black/10 dark:bg-white/10" />

        <button type="button" title="По левому краю" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={`${toolbarButtonClass} ${editor.isActive({ textAlign: "left" }) ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}><AlignLeftIcon /></button>
        <button type="button" title="По центру" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={`${toolbarButtonClass} ${editor.isActive({ textAlign: "center" }) ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}><AlignCenterIcon /></button>
        <button type="button" title="По правому краю" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={`${toolbarButtonClass} ${editor.isActive({ textAlign: "right" }) ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}><AlignRightIcon /></button>
        <button type="button" title="По ширине" onClick={() => editor.chain().focus().setTextAlign("justify").run()} className={`${toolbarButtonClass} ${editor.isActive({ textAlign: "justify" }) ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}><AlignJustifyIcon /></button>

        <span className="mx-1 h-4 w-px bg-black/10 dark:bg-white/10" />

        <button type="button" title="Маркированный список" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${toolbarButtonClass} ${editor.isActive("bulletList") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}>≡</button>
        <button type="button" title="Нумерованный список" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${toolbarButtonClass} ${editor.isActive("orderedList") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}>1.</button>
        <button type="button" title="Цитата" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${toolbarButtonClass} ${editor.isActive("blockquote") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}><BlockquoteIcon /></button>
        <button type="button" title="Горизонтальная линия" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={toolbarButtonClass}><HrIcon /></button>
        <button
          type="button"
          title="Ссылка"
          onClick={() => {
            const url = window.prompt("URL ссылки");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`${toolbarButtonClass} ${editor.isActive("link") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}
        >
          🔗
        </button>

        <span className="mx-1 h-4 w-px bg-black/10 dark:bg-white/10" />

        <button type="button" title="Подстрочный" onClick={() => editor.chain().focus().toggleSubscript().run()} className={`${toolbarButtonClass} ${editor.isActive("subscript") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}>x₂</button>
        <button type="button" title="Надстрочный" onClick={() => editor.chain().focus().toggleSuperscript().run()} className={`${toolbarButtonClass} ${editor.isActive("superscript") ? "bg-zinc-300 dark:bg-zinc-700" : ""}`}>x²</button>

        <span className="mx-1 h-4 w-px bg-black/10 dark:bg-white/10" />

        <button type="button" title="Отменить" onClick={() => editor.chain().focus().undo().run()} className={toolbarButtonClass}>↶</button>
        <button type="button" title="Повторить" onClick={() => editor.chain().focus().redo().run()} className={toolbarButtonClass}>↷</button>
        <button type="button" title="Очистить форматирование" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} className={toolbarButtonClass}>✕</button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[140px] p-3 text-sm leading-relaxed outline-none prose prose-sm max-w-none dark:prose-invert"
      />
    </div>
  );
}
