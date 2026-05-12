"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { HomepageNewsSidebarItem } from "@/components/homepage-news-sidebar";
import { SidebarItemTitle } from "@/components/sidebar-item-title";

type HomepageNewsSidebarStripProps = {
  latest: HomepageNewsSidebarItem[];
  popular: HomepageNewsSidebarItem[];
};

export function HomepageNewsSidebarStrip({ latest, popular }: HomepageNewsSidebarStripProps) {
  const [activeTab, setActiveTab] = useState<"latest" | "popular">("latest");
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);

  const latestItems = latest.slice(0, 10);
  const popularItems = popular.slice(0, 10);
  const activeConfig =
    activeTab === "latest"
      ? {
          items: latestItems,
          emptyLabel: "Новостей пока нет.",
        }
      : {
          items: popularItems,
          emptyLabel: "Популярных новостей пока нет.",
        };

  useEffect(() => {
    setIsExpandedMobile(false);
  }, [activeTab]);

  const mobileItems = isExpandedMobile ? activeConfig.items.slice(0, 10) : activeConfig.items.slice(0, 4);

  return (
    <aside className="overflow-hidden border border-black/10 bg-white text-foreground shadow-[0_24px_60px_-42px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-[#12202d] dark:text-white">
      <div className="border-b border-black/10 px-5 py-4 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <button
            type="button"
            onClick={() => setActiveTab("latest")}
            className={
              activeTab === "latest"
                ? "relative font-menu text-[13px] font-bold tracking-[0.02em] text-foreground transition-colors dark:text-white"
                : "font-menu text-[13px] font-normal tracking-[0.02em] text-zinc-500 transition-colors hover:text-foreground dark:text-zinc-400 dark:hover:text-white"
            }
          >
            Свежие
            {activeTab === "latest" ? (
              <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-[3px] bg-emerald-700 dark:bg-emerald-300" />
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("popular")}
            className={
              activeTab === "popular"
                ? "relative font-menu text-[13px] font-bold tracking-[0.02em] text-foreground transition-colors dark:text-white"
                : "font-menu text-[13px] font-normal tracking-[0.02em] text-zinc-500 transition-colors hover:text-foreground dark:text-zinc-400 dark:hover:text-white"
            }
          >
            Популярные
            {activeTab === "popular" ? (
              <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-[3px] bg-emerald-700 dark:bg-emerald-300" />
            ) : null}
          </button>
        </div>
      </div>

      <div>
        {activeConfig.items.length ? (
          <>
            <div className="xl:hidden">
              {mobileItems.map((item) => (
                <Link
                  key={`${activeTab}-${item.documentId}`}
                  href={`/news/${item.slug}`}
                  data-material-label={item.materialLabel?.trim().toLowerCase() ?? ""}
                  className="block min-w-0 border-b border-black/10 px-5 py-4 transition-colors hover:bg-black/[0.03] last:border-b-0 dark:border-white/10 dark:hover:bg-white/[0.03]"
                >
                  <div className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] items-start gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-menu pt-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 whitespace-nowrap dark:text-emerald-300">
                        {item.publishedLabel}
                      </span>
                    </div>
                    <SidebarItemTitle
                      title={item.title}
                      materialLabel={item.materialLabel}
                      className="min-w-0 break-words font-[Lato] text-[15px] leading-[1.45] text-[#10211a] dark:text-white"
                      badgeClassName="inline-flex w-fit items-center rounded-[2px] px-1 py-0 font-menu text-[12px] font-normal leading-[16px] tracking-[0.10em] text-white uppercase"
                      badgeBackgroundClassName={
                        item.materialLabel?.trim().toLowerCase() === "video" ? "bg-[#cfe95b]" : "bg-[#1d5b43]"
                      }
                      gapPx={8}
                    />
                  </div>
                </Link>
              ))}

              {!isExpandedMobile && activeConfig.items.length > 4 ? (
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
              {activeConfig.items.map((item) => (
                <Link
                  key={`${activeTab}-${item.documentId}`}
                  href={`/news/${item.slug}`}
                  data-material-label={item.materialLabel?.trim().toLowerCase() ?? ""}
                  className="block min-w-0 border-b border-black/10 px-5 py-4 transition-colors hover:bg-black/[0.03] last:border-b-0 dark:border-white/10 dark:hover:bg-white/[0.03]"
                >
                  <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)] items-start gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-menu pt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 whitespace-nowrap dark:text-emerald-300">
                        {item.publishedLabel}
                      </span>
                    </div>
                    <SidebarItemTitle
                      title={item.title}
                      materialLabel={item.materialLabel}
                      className="min-w-0 break-words font-[Lato] text-[15px] leading-[1.42] text-[#10211a] dark:text-white"
                      badgeClassName="inline-flex w-fit items-center rounded-[2px] px-1 py-0 font-menu text-[12px] font-normal leading-[16px] tracking-[0.10em] text-white uppercase"
                      badgeBackgroundClassName={
                        item.materialLabel?.trim().toLowerCase() === "video" ? "bg-[#cfe95b]" : "bg-[#1d5b43]"
                      }
                      gapPx={8}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="type-body p-5 text-zinc-600 dark:text-zinc-400">{activeConfig.emptyLabel}</div>
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
