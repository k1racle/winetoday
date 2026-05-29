"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type HomepageSpecialVideoMobileProps = {
  videos: {
    documentId: string;
    href: string;
    title: string;
    cover?: { url?: string | null; alternativeText?: string | null } | null;
    videoUrl?: string | null;
    duration?: number | null;
  }[];
  siteLogoUrl?: string | null;
  siteLogoAlt?: string | null;
};

function formatVideoDurationLabel(durationMinutes?: number | null) {
  if (!durationMinutes || durationMinutes < 1) {
    return null;
  }

  const minutes = Math.floor(durationMinutes);

  return `${String(minutes).padStart(2, "0")}:00`;
}

function resolvePreviewEmbedUrl(videoUrl?: string | null) {
  if (!videoUrl) {
    return null;
  }

  try {
    const url = new URL(videoUrl);

    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");

      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&playsinline=1` : null;
    }

    if (url.hostname.includes("youtu.be")) {
      const videoId = url.pathname.replace(/^\//, "");

      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&playsinline=1` : null;
    }

    if (url.hostname.includes("vimeo.com")) {
      const videoId = url.pathname.replace(/^\//, "");

      return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&background=1` : null;
    }

    return null;
  } catch {
    return null;
  }
}

function VideoPlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M8 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
    </svg>
  );
}

function SiteLogoMark({ logoUrl, logoAlt }: { logoUrl?: string | null; logoAlt?: string | null }) {
  if (!logoUrl) {
    return null;
  }

  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-white/95 p-1 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <Image src={logoUrl} alt={logoAlt ?? ""} width={20} height={20} className="h-full w-full object-contain" />
    </span>
  );
}

function VideoDurationBadge({ durationMinutes }: { durationMinutes?: number | null }) {
  const label = formatVideoDurationLabel(durationMinutes);

  if (!label) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-emerald-950/80 text-white">
        <VideoPlayIcon className="h-2.5 w-2.5" />
      </span>
      {label}
    </span>
  );
}

export function HomepageSpecialVideoMobile({ videos, siteLogoUrl, siteLogoAlt }: HomepageSpecialVideoMobileProps) {
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

          <div className="pointer-events-none absolute left-2 top-2 z-20">
            <SiteLogoMark logoUrl={siteLogoUrl} logoAlt={siteLogoAlt} />
          </div>

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
                    "relative w-[min(42vw,168px)] shrink-0 overflow-hidden rounded-md border text-left transition",
                    isActive
                      ? "border-emerald-700 ring-2 ring-emerald-700/40 ring-offset-2 ring-offset-white dark:border-emerald-400 dark:ring-emerald-400/40 dark:ring-offset-[#0b1612]"
                      : "border-black/10 opacity-95 hover:opacity-100 dark:border-white/10",
                  ].join(" ")}
                >
                  <div className="relative aspect-[4/5] w-full bg-black shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)]">
                    {video.cover?.url ? (
                      <Image
                        src={video.cover.url}
                        alt={video.cover.alternativeText ?? video.title}
                        fill
                        sizes="168px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(28,55,40,0.55),_rgba(0,0,0,0.95))]" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                    <div className="absolute left-1.5 top-1.5 z-10">
                      <VideoDurationBadge durationMinutes={video.duration} />
                    </div>

                    <div className="absolute right-1.5 top-1.5 z-10">
                      <SiteLogoMark logoUrl={siteLogoUrl} logoAlt={siteLogoAlt} />
                    </div>

                    <p className="absolute inset-x-0 bottom-0 z-10 px-2 pb-2 pt-6 font-[Lato,var(--font-inter),system-ui,sans-serif] text-[13px] font-medium leading-[1.2] text-white">
                      <span className="line-clamp-3">{video.title}</span>
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
