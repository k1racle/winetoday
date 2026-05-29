"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type HomepageSpecialVideoItem,
  VideoDurationBadge,
  VideoPlayIcon,
  resolvePreviewEmbedUrl,
} from "@/components/homepage-special-video-shared";

type HomepageSpecialVideoDesktopProps = {
  videos: HomepageSpecialVideoItem[];
};

const DESKTOP_VISIBLE_COUNT = 4;

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d={direction === "left" ? "M14.5 6.5 9 12l5.5 5.5" : "M9.5 6.5 15 12l-5.5 5.5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomepageSpecialVideoDesktop({ videos }: HomepageSpecialVideoDesktopProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);

  const activeVideo = videos[activeIndex] ?? videos[0] ?? null;
  const embedUrl = useMemo(() => resolvePreviewEmbedUrl(activeVideo?.videoUrl), [activeVideo?.videoUrl]);
  const pageCount = Math.max(1, Math.ceil(videos.length / DESKTOP_VISIBLE_COUNT));
  const canGoPrev = pageIndex > 0;
  const canGoNext = pageIndex < pageCount - 1;

  useEffect(() => {
    setActiveIndex(0);
    setPageIndex(0);
  }, [videos]);

  const scrollToPage = useCallback((nextPageIndex: number) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const clampedPage = Math.max(0, Math.min(pageCount - 1, nextPageIndex));
    const firstItem = track.children[clampedPage * DESKTOP_VISIBLE_COUNT] as HTMLElement | undefined;

    track.scrollTo({
      left: firstItem ? firstItem.offsetLeft - track.offsetLeft : 0,
      behavior: "smooth",
    });

    setPageIndex(clampedPage);
  }, [pageCount]);

  useEffect(() => {
    const track = trackRef.current;

    if (!track || videos.length <= DESKTOP_VISIBLE_COUNT) {
      return;
    }

    const handleScroll = () => {
      const items = Array.from(track.children) as HTMLElement[];

      if (!items.length) {
        return;
      }

      const trackLeft = track.scrollLeft;
      let nearestIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      items.forEach((item, index) => {
        const distance = Math.abs(item.offsetLeft - track.offsetLeft - trackLeft);

        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = index;
        }
      });

      setPageIndex(Math.floor(nearestIndex / DESKTOP_VISIBLE_COUNT));
    };

    track.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      track.removeEventListener("scroll", handleScroll);
    };
  }, [videos.length]);

  if (!activeVideo) {
    return null;
  }

  return (
    <div className="hidden space-y-4 xl:block">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2.5">
          <p className="type-h4 leading-none text-zinc-900 dark:text-white">Видео</p>
          <h2 className="font-[Lato,var(--font-inter),system-ui,sans-serif] text-[24px] font-bold leading-[1.18] tracking-[-0.01em] text-[#10211a] dark:text-white">
            <Link href={activeVideo.href} className="transition hover:text-emerald-700 dark:hover:text-emerald-200">
              {activeVideo.title}
            </Link>
          </h2>
        </div>
        <Link
          href="/videos"
          className="shrink-0 pt-1 text-sm font-medium text-amber-400 transition hover:text-amber-300"
        >
          Все видео →
        </Link>
      </div>

      <article className="relative overflow-hidden border border-black/10 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-white/[0.04]">
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <Link href={activeVideo.href} aria-label={activeVideo.title} className="absolute inset-0 z-0 block">
            {activeVideo.cover?.url ? (
              <Image
                src={activeVideo.cover.url}
                alt={activeVideo.cover.alternativeText ?? activeVideo.title}
                fill
                sizes="(min-width: 1280px) 66vw, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(28,55,40,0.55),_rgba(0,0,0,0.95))]" />
            )}
          </Link>

          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={activeVideo.title}
              className="pointer-events-none absolute inset-0 z-10 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              tabIndex={-1}
            />
          ) : null}

          {!embedUrl ? (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-950/55 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
                <VideoPlayIcon className="ml-1 h-10 w-10" />
              </span>
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] bg-black/25">
            <div className="h-full w-[88%] bg-emerald-600 dark:bg-emerald-400" />
          </div>
        </div>
      </article>

      {videos.length > 1 ? (
        <div className="space-y-3">
          <div
            ref={trackRef}
            className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {videos.map((video, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={video.documentId}
                  type="button"
                  aria-label={`Показать видео: ${video.title}`}
                  aria-pressed={isActive}
                  onClick={() => setActiveIndex(index)}
                  className={[
                    "w-[calc((100%-2.25rem)/4)] min-w-[calc((100%-2.25rem)/4)] shrink-0 overflow-hidden rounded-md border bg-white text-left shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] transition dark:bg-white/[0.04]",
                    isActive
                      ? "border-emerald-700 ring-2 ring-emerald-700/40 dark:border-emerald-400 dark:ring-emerald-400/40"
                      : "border-black/10 hover:border-emerald-700/50 dark:border-white/10",
                  ].join(" ")}
                >
                  <div className="relative aspect-video w-full bg-black">
                    {video.cover?.url ? (
                      <Image
                        src={video.cover.url}
                        alt={video.cover.alternativeText ?? video.title}
                        fill
                        sizes="(min-width: 1280px) 25vw, 240px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(28,55,40,0.55),_rgba(0,0,0,0.95))]" />
                    )}

                    <div className="absolute left-2 top-2 z-10">
                      <VideoDurationBadge durationMinutes={video.duration} />
                    </div>
                  </div>

                  <div className="px-3 py-3">
                    <p className="line-clamp-2 font-[Lato,var(--font-inter),system-ui,sans-serif] text-[16px] font-bold leading-[1.25] text-[#10211a] dark:text-white">
                      {video.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {videos.length > DESKTOP_VISIBLE_COUNT ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: pageCount }, (_, index) => (
                <button
                  key={`video-page-${index}`}
                  type="button"
                  aria-label={`Перейти к странице ${index + 1}`}
                  aria-pressed={index === pageIndex}
                  onClick={() => scrollToPage(index)}
                  className={[
                    "rounded-full transition",
                    index === pageIndex
                      ? "h-2.5 w-8 bg-emerald-700 dark:bg-emerald-400"
                      : "h-2.5 w-2.5 bg-black/15 hover:bg-black/30 dark:bg-white/20 dark:hover:bg-white/35",
                  ].join(" ")}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Предыдущие видео"
                disabled={!canGoPrev}
                onClick={() => scrollToPage(pageIndex - 1)}
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-full border transition",
                  canGoPrev
                    ? "border-black/10 bg-white text-zinc-700 hover:border-emerald-700/40 hover:text-emerald-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    : "cursor-not-allowed border-black/5 bg-black/[0.03] text-black/25 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/25",
                ].join(" ")}
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                aria-label="Следующие видео"
                disabled={!canGoNext}
                onClick={() => scrollToPage(pageIndex + 1)}
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-full border transition",
                  canGoNext
                    ? "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800 dark:border-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                    : "cursor-not-allowed border-black/5 bg-black/[0.03] text-black/25 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/25",
                ].join(" ")}
              >
                <ChevronIcon direction="right" />
              </button>
            </div>
          </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
