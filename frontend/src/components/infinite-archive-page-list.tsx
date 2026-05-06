"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { OverlayMetaItem } from "@/components/archive-overlay-meta";

function getPrimaryMetaLabel(meta?: OverlayMetaItem[] | null) {
  const primaryMeta = meta?.[0];

  if (!primaryMeta) {
    return null;
  }

  return typeof primaryMeta === "string" ? primaryMeta : primaryMeta.label;
}

function getPrimaryMetaHref(meta?: OverlayMetaItem[] | null) {
  const primaryMeta = meta?.[0];

  if (!primaryMeta || typeof primaryMeta === "string") {
    return null;
  }

  return primaryMeta.href?.trim() ? primaryMeta.href.trim() : null;
}

type ArchivePageCard = {
  id: string;
  href: string;
  title: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  meta?: OverlayMetaItem[] | null;
};

type InfiniteArchivePageListProps = {
  leadItem?: ArchivePageCard | null;
  items: ArchivePageCard[];
  emptyLabel: string;
  pageSize?: number;
  showExcerpt?: boolean;
};

const DEFAULT_PAGE_SIZE = 10;

export function InfiniteArchivePageList({ leadItem, items, emptyLabel, pageSize = DEFAULT_PAGE_SIZE, showExcerpt = true }: InfiniteArchivePageListProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasMore = visibleCount < items.length;
  const visibleItems = items.slice(0, visibleCount);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + pageSize, items.length));
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, items.length, pageSize]);

  return (
    <div className="mt-10 grid gap-y-6">
      {!leadItem && !items.length ? (
        <div className="type-small border-b border-dashed border-black/10 pb-6 text-zinc-600 dark:border-white/10 dark:text-zinc-400">
          {emptyLabel}
        </div>
      ) : null}

      {leadItem ? (
        <article className="group grid overflow-hidden border border-black/10 bg-white text-foreground shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-[#12202d] dark:text-white md:grid-cols-[340px_minmax(0,1fr)]">
          <div className="relative h-64 overflow-hidden md:h-full">
            <Link href={leadItem.href} aria-label={leadItem.title} className="block h-full">
              {leadItem.imageUrl ? (
                <Image src={leadItem.imageUrl} alt={leadItem.imageAlt ?? leadItem.title} width={680} height={512} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
              ) : null}
            </Link>
          </div>
          <div className="flex flex-col justify-center p-5">
            {(() => {
              const primaryMetaLabel = getPrimaryMetaLabel(leadItem.meta);
              const primaryMetaHref = getPrimaryMetaHref(leadItem.meta);

              return primaryMetaLabel ? (
                <div className="type-caption mb-3 !text-[12px] text-emerald-700 dark:text-emerald-300">
                  {primaryMetaHref ? (
                    <Link href={primaryMetaHref} className="transition hover:text-emerald-800 dark:hover:text-emerald-200">
                      {primaryMetaLabel}
                    </Link>
                  ) : (
                    primaryMetaLabel
                  )}
                </div>
              ) : null;
            })()}
            <h2 className="type-h4 text-foreground dark:text-white">
              <Link href={leadItem.href} className="transition hover:text-emerald-800 dark:hover:text-emerald-300">
                {leadItem.title}
              </Link>
            </h2>
            {showExcerpt && leadItem.excerpt ? <p className="type-body mt-4 leading-[1.4] text-zinc-600 dark:text-zinc-400">{leadItem.excerpt}</p> : null}
          </div>
        </article>
      ) : null}

      {visibleItems.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <article key={item.id} className="group block overflow-hidden border border-black/10 bg-white text-foreground shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-[#12202d] dark:text-white">
              <div className="relative h-52 overflow-hidden">
                <Link href={item.href} aria-label={item.title} className="block h-full">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.imageAlt ?? item.title} width={720} height={448} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                  ) : null}
                </Link>
              </div>
              <div className="p-5">
                {(() => {
                  const primaryMetaLabel = getPrimaryMetaLabel(item.meta);
                  const primaryMetaHref = getPrimaryMetaHref(item.meta);

                  return primaryMetaLabel ? (
                    <div className="type-caption mb-2 !text-[12px] text-emerald-700 dark:text-emerald-300">
                      {primaryMetaHref ? (
                        <Link href={primaryMetaHref} className="transition hover:text-emerald-800 dark:hover:text-emerald-200">
                          {primaryMetaLabel}
                        </Link>
                      ) : (
                        primaryMetaLabel
                      )}
                    </div>
                  ) : null;
                })()}
                <h2 className="type-h4 text-foreground dark:text-white">
                  <Link href={item.href} className="transition hover:text-emerald-800 dark:hover:text-emerald-300">
                    {item.title}
                  </Link>
                </h2>
                {showExcerpt && item.excerpt ? <p className="type-body mt-4 leading-[1.4] text-zinc-600 dark:text-zinc-400">{item.excerpt}</p> : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {hasMore ? (
        <>
          <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setVisibleCount((current) => Math.min(current + pageSize, items.length))}
              className="type-button inline-flex items-center gap-2 border border-black/10 px-4 py-3 text-[#0d3132] transition-colors hover:border-emerald-700 hover:text-emerald-900 dark:border-white/10 dark:text-white dark:hover:border-emerald-400 dark:hover:text-emerald-300"
            >
              Показать еще
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
