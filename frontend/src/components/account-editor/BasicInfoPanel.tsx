"use client";

import { EditorPanel } from "./EditorPanel";
import type { FormState } from "./types";

const inputClassName =
  "w-full rounded border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100";

const textareaClassName =
  "w-full resize-y rounded border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100";

type BasicInfoPanelProps = {
  form: Pick<FormState, "title" | "slug" | "excerpt">;
  onChange: <K extends "title" | "slug" | "excerpt">(key: K, value: FormState[K]) => void;
  onApplyTypograf: () => void;
};

export function BasicInfoPanel({ form, onChange, onApplyTypograf }: BasicInfoPanelProps) {
  return (
    <EditorPanel title={<>Основная информация</>}>
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Заголовок <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(event) => onChange("title", event.target.value)}
              placeholder="Введите заголовок..."
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Ссылка (slug)</label>
            <input
              type="text"
              value={form.slug}
              onChange={(event) => onChange("slug", event.target.value)}
              placeholder="slug-materiala"
              className={inputClassName}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onApplyTypograf}
          className="w-fit rounded border border-black/10 bg-[#eeeeee] px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-300 dark:border-white/10 dark:bg-[#2a2a2a] dark:hover:bg-zinc-700"
        >
          ✨ Применить типограф
        </button>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Краткое описание</label>
          <textarea
            value={form.excerpt}
            onChange={(event) => onChange("excerpt", event.target.value)}
            placeholder="Для публикации обязательно..."
            rows={3}
            className={textareaClassName}
          />
        </div>
      </div>
    </EditorPanel>
  );
}
