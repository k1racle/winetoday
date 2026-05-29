"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  type HomepageSpecialVideoItem,
  VideoDurationBadge,
  VideoPlayIcon,
  resolvePreviewEmbedUrl,
} from "@/components/homepage-special-video-shared";

type HomepageSpecialVideoMobileProps = {
  videos: HomepageSpecialVideoItem[];
};

export function HomepageSpecialVideoMobile({ videos }: HomepageSpecialVideoMobileProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVideo = videos[activeIndex] ?? videos[0] ?? null;
  const embedUrl = useMemo(() => resolvePreviewEmbedUrl(activeVideo?.videoUrl), [activeVideo?.videoUrl]);

  useEffect(() => {
    setActiveIndex(0);
  }, [videos]);

  if (!activeVideo) {
    return null;
  }

  return (
    <div className="space-y-3 xl:hidden">
      <div className="space-y-2.5">
        <p className="text-[18px] font-bold leading-none text-zinc-900 dark:text-white">Видео</p>
        <h2 className="font-[Lato,var(--font-inter),system-ui,sans-serif] text-[18px] font-bold leading-[1.35] text-[#10211a] dark:text-white sm:text-[20px]">
          <Link href={activeVideo.href} className="transition hover:text-emerald-700 dark:hover:text-emerald-200">
            {activeVideo.title}
          </Link>
        </h2>
      </div>

      <article className="relative overflow-hidden border border-black/10 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-white/[0.04]">
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <Link href={activeVideo.href} aria-label={activeVideo.title} className="absolute inset-0 z-0 block">
            {activeVideo.cover?.url ? (
              <Image
                src={activeVideo.cover.url}
                alt={activeVideo.cover.alternativeText ?? activeVideo.title}
                fill
                sizes="100vw"
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
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950/55 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:h-16 sm:w-16">
                <VideoPlayIcon className="ml-1 h-6 w-6 sm:h-7 sm:w-7" />
              </span>
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] bg-black/25">
            <div className="h-full w-[88%] bg-emerald-600 dark:bg-emerald-400" />
          </div>
        </div>
      </article>

      {videos.length > 1 ? (
        <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full gap-2">
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
                    "relative w-[min(58vw,240px)] shrink-0 overflow-hidden rounded-md border text-left transition",
                    isActive
                      ? "border-emerald-700 ring-2 ring-emerald-700/40 ring-offset-2 ring-offset-white dark:border-emerald-400 dark:ring-emerald-400/40 dark:ring-offset-[#0b1612]"
                      : "border-black/10 opacity-95 hover:opacity-100 dark:border-white/10",
                  ].join(" ")}
                >
                  <div className="relative aspect-video w-full bg-black shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)]">
                    {video.cover?.url ? (
                      <Image
                        src={video.cover.url}
                        alt={video.cover.alternativeText ?? video.title}
                        fill
                        sizes="240px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(28,55,40,0.55),_rgba(0,0,0,0.95))]" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    <div className="absolute left-1.5 top-1.5 z-10">
                      <VideoDurationBadge durationMinutes={video.duration} />
                    </div>

                    <p className="absolute inset-x-0 bottom-0 z-10 px-2 pb-2 pt-4 font-[Lato,var(--font-inter),system-ui,sans-serif] text-[12px] font-medium leading-[1.2] text-white sm:text-[13px]">
                      <span className="line-clamp-2">{video.title}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
