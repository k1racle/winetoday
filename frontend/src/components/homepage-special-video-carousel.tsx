"use client";

import { useMemo, useState } from "react";

import type { OverlayMetaItem } from "@/components/archive-overlay-meta";
import { HomepageSpecialVideoTile } from "@/components/homepage-special-video-tile";

type HomepageSpecialVideoCarouselProps = {
  videos: {
    documentId: string;
    href: string;
    title: string;
    cover?: { url?: string | null; alternativeText?: string | null } | null;
    videoUrl?: string | null;
    meta: OverlayMetaItem[];
  }[];
};

const VISIBLE_ITEMS = 2;

export function HomepageSpecialVideoCarousel({ videos }: HomepageSpecialVideoCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);

  const leadVideo = videos[0] ?? null;
  const secondaryVideos = useMemo(() => videos.slice(1), [videos]);
  const maxStartIndex = Math.max(secondaryVideos.length - VISIBLE_ITEMS, 0);
  const visibleVideos = secondaryVideos.slice(startIndex, startIndex + VISIBLE_ITEMS);

  if (!leadVideo) {
    return null;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] xl:items-start">
      <HomepageSpecialVideoTile
        href={leadVideo.href}
        title={leadVideo.title}
        coverUrl={leadVideo.cover?.url ?? null}
        coverAlt={leadVideo.cover?.alternativeText ?? leadVideo.title}
        videoUrl={leadVideo.videoUrl}
        meta={leadVideo.meta}
        className="h-full"
        titleBelow
        bodyClassName="p-5 sm:p-6"
        titleClassName="type-h3"
        imageSizes="(max-width: 1279px) 100vw, 66vw"
      />

      {secondaryVideos.length ? (
        <div className="flex flex-col gap-3">
          <div className="grid gap-4">
            {visibleVideos.map((video) => (
              <HomepageSpecialVideoTile
                key={video.documentId}
                href={video.href}
                title={video.title}
                coverUrl={video.cover?.url ?? null}
                coverAlt={video.cover?.alternativeText ?? video.title}
                videoUrl={video.videoUrl}
                meta={video.meta}
                contentClassName="p-4"
                imageSizes="(max-width: 1279px) 100vw, 320px"
                compactPlayButton
                titleBelow
                bodyWrapperClassName="xl:hidden"
                bodyClassName="px-4 py-3"
              />
            ))}
          </div>

          {secondaryVideos.length > VISIBLE_ITEMS ? (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStartIndex((current) => Math.max(current - 1, 0))}
                disabled={startIndex === 0}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/90 text-[#0d3132] transition hover:border-emerald-700 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:border-emerald-200 dark:hover:text-emerald-200"
                aria-label="Показать предыдущие видео"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path d="M12 8l-6 6h12l-6-6z" fill="currentColor" />
                </svg>
              </button>
              <span className="text-sm text-[#4b5d63] dark:text-white/70">
                {Math.min(startIndex + VISIBLE_ITEMS, secondaryVideos.length)} / {secondaryVideos.length}
              </span>
              <button
                type="button"
                onClick={() => setStartIndex((current) => Math.min(current + 1, maxStartIndex))}
                disabled={startIndex >= maxStartIndex}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/90 text-[#0d3132] transition hover:border-emerald-700 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:border-emerald-200 dark:hover:text-emerald-200"
                aria-label="Показать следующие видео"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path d="M12 16l6-6H6l6 6z" fill="currentColor" />
                </svg>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
