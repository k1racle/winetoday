"use client";

import { useMemo } from "react";
import type { EditorContentType, EditorEntrySummary, EditorSession } from "./types";
import { sortEditorTypes, timeAgoLabel } from "./utils";

const TYPE_LABELS: Record<EditorContentType, string> = {
  article: "Статьи",
  news: "Новости",
  video: "Видео",
  gallery: "Галереи",
  homepage: "Главная",
};

const TYPE_ICONS: Record<EditorContentType, string> = {
  article: "📄",
  news: "✎",
  video: "🎬",
  gallery: "🖼",
  homepage: "🏠",
};

type EditorSidebarProps = {
  session: EditorSession | null;
  items: Record<EditorContentType, EditorEntrySummary[]>;
  selectedType: EditorContentType;
  onSelectType: (type: EditorContentType) => void;
  onCreateNew: (type: EditorContentType) => void;
  onSelectItem: (type: EditorContentType, documentId: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function EditorSidebar({
  session,
  items,
  selectedType,
  onSelectType,
  onCreateNew,
  onSelectItem,
  query,
  onQueryChange,
  page,
  totalPages,
  onPageChange,
}: EditorSidebarProps) {
  const allowedTypes = useMemo(() => sortEditorTypes(session?.capabilities.canCreate ?? []), [session]);
  const normalizedQuery = query.trim().toLowerCase();
  const currentItems = useMemo(() => items[selectedType] ?? [], [items, selectedType]);
  const filteredItems = useMemo(() => {
    if (!normalizedQuery) {
      return currentItems;
    }
    return currentItems.filter((item) => item.title.toLowerCase().includes(normalizedQuery));
  }, [currentItems, normalizedQuery]);
  const itemsPerPage = 20;
  const startIndex = (page - 1) * itemsPerPage;
  const visibleItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-60 min-w-[15rem] overflow-y-auto border-r border-black/10 bg-[#f5f5f5] dark:border-white/10 dark:bg-[#1e1e1e]">
      <div className="flex items-center gap-3 border-b border-black/10 p-4 dark:border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f] text-sm font-semibold text-white dark:from-[#4ade80] dark:to-[#86efac] dark:text-black">
          {session?.user?.memberProfile?.displayName?.[0]?.toUpperCase() || session?.user?.username?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <div className="text-sm font-semibold">{session?.user?.memberProfile?.displayName || session?.user?.username || "Пользователь"}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Роль: {session?.user?.memberProfile?.accountType === "editor" ? "Редактор" : "Автор"}
          </div>
        </div>
      </div>

      <div className="px-3 pt-3">
        <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Тип материала</div>
        {allowedTypes.map((type) => {
          const count = items[type]?.length ?? 0;
          const isActive = type === selectedType;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelectType(type)}
              className={`mb-1 flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-emerald-100 font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                  : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <span>{TYPE_ICONS[type]}</span>
              <span>{TYPE_LABELS[type]}</span>
              <span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] ${isActive ? "bg-emerald-700 text-white dark:bg-emerald-500 dark:text-black" : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"}`}>
                {count}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onCreateNew(selectedType)}
          className="mt-2 w-full rounded bg-[#1a4d2e] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2d7a4f] dark:bg-[#4ade80] dark:text-black dark:hover:bg-[#86efac]"
        >
          ＋ Новый материал
        </button>
      </div>

      <div className="px-3 pt-4">
        <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Все материалы</div>
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Фильтр по заголовку..."
          className="mb-2 w-full rounded border border-black/10 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#1a4d2e] dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100"
        />

        <div className="space-y-1">
          {visibleItems.map((item) => (
            <button
              key={item.documentId}
              type="button"
              onClick={() => onSelectItem(selectedType, item.documentId)}
              className="w-full rounded p-2 text-left transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              <div className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">{item.title}</div>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                <span className={`h-1.5 w-1.5 rounded-full ${item.status === "published" ? "bg-emerald-500" : "bg-amber-500"}`} />
                {item.status === "published" ? "Опубликовано" : "Черновик"}
                <span>·</span>
                <span>{timeAgoLabel(item.updatedAt || item.publishedAt)}</span>
              </div>
            </button>
          ))}
          {filteredItems.length === 0 ? (
            <div className="px-2 py-3 text-xs text-zinc-500 dark:text-zinc-400">Нет материалов</div>
          ) : null}
        </div>

        {totalPages > 1 ? (
          <div className="mt-2 flex items-center justify-between px-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span>Стр. {page} из {totalPages}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="rounded border border-black/10 px-2 py-1 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:border-white/10 dark:hover:bg-zinc-800"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="rounded border border-black/10 px-2 py-1 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:border-white/10 dark:hover:bg-zinc-800"
              >
                →
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
