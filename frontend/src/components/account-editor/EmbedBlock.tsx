"use client";

import type { EditorEmbedBlock } from "./types";

const inputClassName =
  "w-full rounded border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100";

const textareaClassName =
  "w-full resize-y rounded border border-black/10 bg-white px-3 py-2 font-mono text-xs text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100";

type EmbedBlockProps = {
  block: EditorEmbedBlock;
  onChange: (block: EditorEmbedBlock) => void;
};

export function EmbedBlock({ block, onChange }: EmbedBlockProps) {
  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Заголовок блока</label>
        <input
          type="text"
          value={block.title ?? ""}
          onChange={(event) => onChange({ ...block, title: event.target.value })}
          placeholder="Необязательно"
          className={inputClassName}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">HTML-код</label>
        <textarea
          value={block.html}
          onChange={(event) => onChange({ ...block, html: event.target.value })}
          placeholder="<iframe ...></iframe>"
          rows={5}
          className={textareaClassName}
        />
      </div>
    </div>
  );
}
