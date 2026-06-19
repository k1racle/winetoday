"use client";

import { useEffect, useMemo, useState } from "react";
import type { EditorContentType, EditorEntrySummary, EditorSession } from "./types";
import { timeAgoLabel } from "./utils";

const TYPE_VIEW_LABELS: Record<string, string> = {
  "api::article.article": "Статьи",
  "api::news.news": "Новости",
  "api::video.video": "Видео",
  "api::gallery.gallery": "Галереи",
};

function formatViewsCount(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toString();
}

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
  allowedTypes: EditorContentType[];
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
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  onHelpClick?: () => void;
};

export function EditorSidebar({
  session,
  allowedTypes,
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
  mobileOpen: mobileOpenProp,
  onMobileOpenChange,
  onHelpClick,
}: EditorSidebarProps) {
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const [authorStats, setAuthorStats] = useState<{ totalViews: number; byType: Record<string, number> } | null>(null);
  const [loadingAuthorStats, setLoadingAuthorStats] = useState(false);
  const mobileOpen = mobileOpenProp ?? internalMobileOpen;

  const authorId = session?.user?.memberProfile?.author?.id ?? null;

  useEffect(() => {
    if (!authorId) {
      setAuthorStats(null);
      return;
    }

    let cancelled = false;
    setLoadingAuthorStats(true);

    fetch(`/api/views/author-stats/${encodeURIComponent(String(authorId))}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load stats");
        }
        const data = (await response.json()) as { totalViews?: number; byType?: Record<string, number> };
        if (!cancelled) {
          setAuthorStats({
            totalViews: typeof data.totalViews === "number" ? data.totalViews : 0,
            byType: data.byType && typeof data.byType === "object" ? data.byType : {},
          });
        }
      })
      .catch((error) => {
        console.error("[author-stats]", error);
        if (!cancelled) {
          setAuthorStats(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingAuthorStats(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authorId]);
  const setMobileOpen = (open: boolean) => {
    setInternalMobileOpen(open);
    onMobileOpenChange?.(open);
  };
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

  function handleSelectType(type: EditorContentType) {
    onSelectType(type);
    setMobileOpen(false);
  }

  function handleSelectItem(type: EditorContentType, documentId: string) {
    onSelectItem(type, documentId);
    setMobileOpen(false);
  }

  function handleHelpClick() {
    setMobileOpen(false);
    onHelpClick?.();
  }

  const sidebarContent = (
    <>
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

      {authorId ? (
        <div className="border-b border-black/10 px-4 py-3 dark:border-white/10">
          <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Статистика просмотров</div>
          {loadingAuthorStats ? (
            <div className="px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400">Загрузка…</div>
          ) : authorStats ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">Всего</span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                  {formatViewsCount(authorStats.totalViews)}
                </span>
              </div>
              {Object.entries(authorStats.byType).map(([uid, views]) => (
                <div key={uid} className="flex items-center justify-between px-2">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">{TYPE_VIEW_LABELS[uid] ?? uid}</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{formatViewsCount(views)}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="px-3 pt-3">
        <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Тип материала</div>
        {allowedTypes.map((type) => {
          const count = items[type]?.length ?? 0;
          const isActive = type === selectedType;

          return (
            <button
              key={type}
              type="button"
              onClick={() => handleSelectType(type)}
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
              onClick={() => handleSelectItem(selectedType, item.documentId)}
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
    </>
  );

  return (
    <>
      <aside className="hidden lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:w-60 lg:min-w-[15rem] lg:overflow-y-auto lg:border-r lg:border-black/10 lg:bg-[#f5f5f5] lg:dark:border-white/10 lg:dark:bg-[#1e1e1e]">
        {sidebarContent}
      </aside>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-72 flex-col border-r border-black/10 bg-[#f5f5f5] transition-transform dark:border-white/10 dark:bg-[#1e1e1e] ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-end border-b border-black/10 p-3 dark:border-white/10">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
              aria-label="Закрыть боковую панель"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sidebarContent}
          </div>
          {onHelpClick ? (
            <div className="sticky bottom-0 border-t border-black/10 bg-[#f5f5f5] p-3 dark:border-white/10 dark:bg-[#1e1e1e] lg:hidden">
              <button
                type="button"
                onClick={handleHelpClick}
                className="flex w-full items-center justify-center gap-2 rounded border border-[#1a4d2e] bg-[#1a4d2e] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2d7a4f] dark:border-[#4ade80] dark:bg-[#4ade80] dark:text-black dark:hover:bg-[#86efac]"
              >
                <span>?</span>
                Помощь
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}
