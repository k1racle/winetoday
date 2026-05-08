"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type HomepageNewsSidebarItem = {
  documentId: string;
  slug: string;
  title: string;
  publishedLabel: string;
  popularityCount: number;
};

type HomepageNewsSidebarProps = {
  latest: HomepageNewsSidebarItem[];
  popular: HomepageNewsSidebarItem[];
  className?: string;
};

export function HomepageNewsSidebar({ latest, popular, className }: HomepageNewsSidebarProps) {
  const [activeTab, setActiveTab] = useState<"latest" | "popular">("latest");
  const latestItems = latest.slice(0, 10);
  const popularItems = popular.slice(0, 10);
  const activeConfig = activeTab === "latest"
    ? {
        items: latestItems,
        emptyLabel: "Новостей пока нет.",
      }
    : {
        items: popularItems,
        emptyLabel: "Популярных новостей пока нет.",
      };

  return (
    <section className={className}>
      <NewsStrip
        items={activeConfig.items}
        emptyLabel={activeConfig.emptyLabel}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </section>
  );
}

type NewsStripProps = {
  items: HomepageNewsSidebarItem[];
  emptyLabel: string;
  activeTab: "latest" | "popular";
  onTabChange: (tab: "latest" | "popular") => void;
};

function NewsStrip({ items, emptyLabel, activeTab, onTabChange }: NewsStripProps) {
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);

  useEffect(() => {
    setIsExpandedMobile(false);
  }, [activeTab]);

  const mobileItems = isExpandedMobile ? items.slice(0, 10) : items.slice(0, 4);

  return (
    <aside className="overflow-hidden border border-black/10 bg-white text-foreground shadow-[0_24px_60px_-42px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-[#12202d] dark:text-white">
      <div className="border-b border-black/10 px-5 py-4 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <button
            type="button"
            onClick={() => onTabChange("latest")}
            className={activeTab === "latest"
              ? "relative font-menu text-[13px] font-bold tracking-[0.02em] text-foreground transition-colors dark:text-white"
              : "font-menu text-[13px] font-normal tracking-[0.02em] text-zinc-500 transition-colors hover:text-foreground dark:text-zinc-400 dark:hover:text-white"
            }
          >
            Свежие
            {activeTab === "latest" ? <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-[3px] bg-emerald-700 dark:bg-emerald-300" /> : null}
          </button>
          <button
            type="button"
            onClick={() => onTabChange("popular")}
            className={activeTab === "popular"
              ? "relative font-menu text-[13px] font-bold tracking-[0.02em] text-foreground transition-colors dark:text-white"
              : "font-menu text-[13px] font-normal tracking-[0.02em] text-zinc-500 transition-colors hover:text-foreground dark:text-zinc-400 dark:hover:text-white"
            }
          >
            Популярные
            {activeTab === "popular" ? <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-[3px] bg-emerald-700 dark:bg-emerald-300" /> : null}
          </button>
        </div>
      </div>

      <div>
        {items.length ? (
          <>
            <div className="xl:hidden">
              {mobileItems.map((item) => (
                <Link
                  key={`${activeTab}-${item.documentId}`}
                  href={`/news/${item.slug}`}
                  className="block min-w-0 border-b border-black/10 px-5 py-4 transition-colors hover:bg-black/[0.03] last:border-b-0 dark:border-white/10 dark:hover:bg-white/[0.03]"
                >
                  <div className="space-y-2">
                     <span className="font-menu block text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                      {item.publishedLabel}
                    </span>
                    <p className="min-w-0 break-words font-[Lato] text-[15px] leading-[1.45] text-[#10211a] dark:text-white">
                      {item.title}
                    </p>
                  </div>
                </Link>
              ))}
              {!isExpandedMobile && items.length > 4 ? (
                <button
                  type="button"
                  onClick={() => setIsExpandedMobile(true)}
                  className="type-small font-menu inline-flex items-center gap-2 px-5 py-4 text-emerald-700 transition-colors hover:text-foreground dark:text-emerald-300 dark:hover:text-white"
                >
                  Еще
                  <span aria-hidden="true">&darr;</span>
                </button>
              ) : null}
            </div>

            <div className="hidden xl:block">
              {items.map((item) => (
                <Link
                  key={`${activeTab}-${item.documentId}`}
                  href={`/news/${item.slug}`}
                  className="block min-w-0 border-b border-black/10 px-5 py-4 transition-colors hover:bg-black/[0.03] last:border-b-0 dark:border-white/10 dark:hover:bg-white/[0.03]"
                >
                  <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)] items-start gap-3">
                     <span className="font-menu pt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                      {item.publishedLabel}
                    </span>
                    <p className="min-w-0 break-words font-[Lato] text-[15px] leading-[1.42] text-[#10211a] dark:text-white">
                      {item.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="type-body p-5 text-zinc-600 dark:text-zinc-400">{emptyLabel}</div>
        )}
      </div>

      <div className="border-t border-black/10 px-5 py-4 dark:border-white/10">
        <Link
          href="/news"
          className="type-small font-menu inline-flex items-center gap-2 text-emerald-700 transition-colors hover:text-foreground dark:text-emerald-300 dark:hover:text-white"
        >
          Все новости
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </aside>
  );
}
