"use client";

import Link from "next/link";
import type { EditorContentType } from "./types";
import { publicPath } from "./utils";

type EditorToolbarProps = {
  type: EditorContentType;
  slug: string;
  status: "draft" | "published";
  documentId: string | null;
  saving: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
};

export function EditorToolbar({ type, slug, status, documentId, saving, onSaveDraft, onPublish }: EditorToolbarProps) {
  const path = publicPath(type, slug);
  const previewUrl = status === "draft" && documentId && path ? `${path}?preview=1` : null;

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-[#f5f5f5] p-3 dark:border-white/10 dark:bg-[#1e1e1e]">
      <div className="flex flex-wrap items-center gap-3">
        {previewUrl ? (
          <Link
            href={previewUrl}
            target="_blank"
            className="text-xs font-medium text-[#1a4d2e] hover:underline dark:text-[#4ade80]"
          >
            👁 Ссылка для предпросмотра
          </Link>
        ) : (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Заполните slug, чтобы появилась ссылка</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving}
          className="rounded border border-black/10 bg-[#eeeeee] px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-300 disabled:opacity-50 dark:border-white/10 dark:bg-[#2a2a2a] dark:hover:bg-zinc-700"
        >
          {saving ? "Сохранение..." : "💾 Сохранить"}
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={saving}
          className="rounded bg-[#1a4d2e] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2d7a4f] disabled:opacity-50 dark:bg-[#4ade80] dark:text-black dark:hover:bg-[#86efac]"
        >
          {saving ? "Сохранение..." : "🚀 Опубликовать"}
        </button>
      </div>
    </div>
  );
}
