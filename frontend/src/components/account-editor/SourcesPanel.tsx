"use client";

import { EditorPanel } from "./EditorPanel";
import type { SourceItem } from "./types";

const inputClassName =
  "w-full rounded border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100";

type SourcesPanelProps = {
  sources: SourceItem[];
  onChange: (index: number, key: keyof SourceItem, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export function SourcesPanel({ sources, onChange, onAdd, onRemove }: SourcesPanelProps) {
  return (
    <EditorPanel title={<>🔗 Источники</>}>
      <div className="grid gap-3">
        {sources.map((source, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={source.name}
              onChange={(event) => onChange(index, "name", event.target.value)}
              placeholder="Название"
              className={inputClassName}
            />
            <input
              type="text"
              value={source.url}
              onChange={(event) => onChange(index, "url", event.target.value)}
              placeholder="https://..."
              className={inputClassName}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="shrink-0 rounded border border-red-200 px-2.5 py-2 text-xs text-red-700 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="w-full rounded border border-dashed border-black/20 py-2 text-xs font-medium text-zinc-600 transition-colors hover:border-emerald-600 hover:text-emerald-700 dark:border-white/20 dark:text-zinc-300 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
        >
          ＋ Добавить источник
        </button>
      </div>
    </EditorPanel>
  );
}
