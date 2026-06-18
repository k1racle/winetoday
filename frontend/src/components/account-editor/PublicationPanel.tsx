"use client";

import { EditorPanel } from "./EditorPanel";
import type { FormState, EditorAuthorOption } from "./types";

const selectClassName =
  "w-full cursor-pointer appearance-none rounded border border-black/10 bg-white bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 16 16'%3E%3Cpath fill='%23666' d='M8 11L3 6h10z'/%3E%3C/svg%3E\")] bg-[length:0.625rem] bg-[right_0.625rem_center] bg-no-repeat px-3 py-2 pr-7 text-sm text-zinc-900 outline-none focus:border-emerald-600 dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100";

const inputClassName =
  "w-full rounded border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100";

type PublicationPanelProps = {
  form: Pick<FormState, "status" | "publishedAtCustom" | "materialLabel" | "author" | "homepageSpecialBlock" | "type">;
  authors: EditorAuthorOption[];
  canEditAll: boolean;
  onChange: <K extends "status" | "publishedAtCustom" | "materialLabel" | "author" | "homepageSpecialBlock">(
    key: K,
    value: FormState[K],
  ) => void;
};

export function PublicationPanel({ form, authors, canEditAll, onChange }: PublicationPanelProps) {
  return (
    <EditorPanel title={<>🕐 Настройки публикации</>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Статус</label>
          <select
            value={form.status}
            onChange={(event) => onChange("status", event.target.value as FormState["status"])}
            className={selectClassName}
          >
            <option value="draft">Черновик</option>
            <option value="published">Опубликовано</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Дата публикации</label>
          <input
            type="datetime-local"
            value={form.publishedAtCustom}
            onChange={(event) => onChange("publishedAtCustom", event.target.value)}
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Метка</label>
          <select
            value={form.materialLabel}
            onChange={(event) => onChange("materialLabel", event.target.value as FormState["materialLabel"])}
            className={selectClassName}
          >
            <option value="none">Ничего</option>
            <option value="exclusive">Эксклюзив</option>
            <option value="video">Видео</option>
          </select>
        </div>

        {canEditAll ? (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Автор</label>
            <select
              value={form.author ?? ""}
              onChange={(event) => onChange("author", event.target.value ? Number(event.target.value) : null)}
              className={selectClassName}
            >
              <option value="">Без автора</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>{author.name}</option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.homepageSpecialBlock}
              onChange={(event) => onChange("homepageSpecialBlock", event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600"
            />
            Вывести на главную в спецблок
          </label>
        </div>
      </div>
    </EditorPanel>
  );
}
