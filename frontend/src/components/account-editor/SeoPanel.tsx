"use client";

import { EditorPanel } from "./EditorPanel";
import type { EditorSeo } from "./types";

const inputClassName =
  "w-full rounded border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100";

const textareaClassName =
  "w-full resize-y rounded border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100";

type SeoPanelProps = {
  seo: EditorSeo;
  onChange: <K extends keyof EditorSeo>(key: K, value: EditorSeo[K]) => void;
};

export function SeoPanel({ seo, onChange }: SeoPanelProps) {
  return (
    <EditorPanel title={<>🔍 SEO-настройки</>}>
      <div className="grid gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Meta Title</label>
          <input
            type="text"
            value={seo.metaTitle}
            onChange={(event) => onChange("metaTitle", event.target.value)}
            placeholder="Заголовок для поисковиков"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Meta Description</label>
          <textarea
            value={seo.metaDescription}
            onChange={(event) => onChange("metaDescription", event.target.value)}
            placeholder="Краткое описание..."
            rows={2}
            className={textareaClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Keywords</label>
          <input
            type="text"
            value={seo.keywords}
            onChange={(event) => onChange("keywords", event.target.value)}
            placeholder="вино, виноделие, виноград"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Canonical URL</label>
          <input
            type="text"
            value={seo.canonicalUrl}
            onChange={(event) => onChange("canonicalUrl", event.target.value)}
            placeholder="https://..."
            className={inputClassName}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={seo.noIndex}
              onChange={(event) => onChange("noIndex", event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600"
            />
            noindex
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={seo.noFollow}
              onChange={(event) => onChange("noFollow", event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600"
            />
            nofollow
          </label>
        </div>
      </div>
    </EditorPanel>
  );
}
