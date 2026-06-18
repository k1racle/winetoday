"use client";

import Link from "next/link";
import type { EditorContentType } from "./types";

const TYPE_LABELS: Record<EditorContentType, string> = {
  article: "Статья",
  news: "Новость",
  video: "Видео",
  gallery: "Галерея",
  homepage: "Главная",
};

type EditorBreadcrumbProps = {
  type: EditorContentType;
  documentId: string | null;
  publicPath: string | null;
  status: "draft" | "published";
};

export function EditorBreadcrumb({ type, documentId, publicPath, status }: EditorBreadcrumbProps) {
  const isHomepage = type === "homepage";
  const title = isHomepage ? "Настройки инфографики" : documentId ? "Редактирование материала" : "Создание материала";
  const subtitle = isHomepage
    ? "Редактирование единственной системной записи главной страницы."
    : `${TYPE_LABELS[type]} · Полноценное редактирование контента с блоками и rich text.`;

  return (
    <div className="relative z-20 border-b border-black/10 bg-[#f5f5f5] px-5 py-4 dark:border-white/10 dark:bg-[#1e1e1e]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav className="mb-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300">Главная</Link>
            <span>/</span>
            <Link href="/account" className="hover:text-zinc-700 dark:hover:text-zinc-300">Редактор</Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-200">{documentId ? "Редактирование" : "Создание"}</span>
          </nav>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>

        {publicPath && status === "published" && !isHomepage ? (
          <Link
            href={publicPath}
            target="_blank"
            className="inline-flex w-fit items-center gap-1 rounded border border-emerald-600 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
          >
            ↗ Перейти к материалу
          </Link>
        ) : null}
      </div>
    </div>
  );
}
