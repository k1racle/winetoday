"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ArchiveOverlayMeta, type OverlayMetaItem } from "@/components/archive-overlay-meta";

type HomepageSpecialVideoTileProps = {
  href: string;
  title: string;
  coverUrl?: string | null;
  coverAlt?: string | null;
  videoUrl?: string | null;
  meta?: OverlayMetaItem[];
  className?: string;
  mediaClassName?: string;
  titleClassName?: string;
  imageSizes?: string;
};

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

export function HomepageSpecialVideoTile({
  href,
  title,
  coverUrl,
  coverAlt,
  videoUrl,
  meta,
  className,
  mediaClassName,
  titleClassName,
  imageSizes,
}: HomepageSpecialVideoTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const embedUrl = useMemo(() => resolvePreviewEmbedUrl(videoUrl), [videoUrl]);
  const shouldAutoplay = isHovered && Boolean(embedUrl);

  return (
    <article
      className={[
        "group relative block overflow-hidden border border-black/10 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.04]",
        className,
      ].filter(Boolean).join(" ")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className={["relative aspect-[16/10] w-full overflow-hidden bg-black", mediaClassName].filter(Boolean).join(" ")}>
        <Link href={href} aria-label={title} className="block h-full w-full">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={coverAlt ?? title}
              fill
              sizes={imageSizes ?? "(max-width: 768px) 100vw, 50vw"}
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(28,55,40,0.55),_rgba(0,0,0,0.95))]" />
          )}
        </Link>

        {shouldAutoplay ? (
          <iframe
            src={embedUrl ?? undefined}
            title={title}
            className="pointer-events-none absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={-1}
          />
        ) : null}

        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-black/88 via-black/34 to-black/12 transition duration-300 group-hover:from-black/80 group-hover:via-black/28 group-hover:to-black/6" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/92 text-[#10351d] shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition duration-300 group-hover:scale-105 group-hover:bg-white">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current" aria-hidden="true">
              <path d="M8 6.5v11l9-5.5-9-5.5Z" />
            </svg>
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-20 p-4 text-white">
          {meta?.length ? (
            <ArchiveOverlayMeta itemId={href} meta={meta} className="mb-3" />
          ) : null}
          <Link
            href={href}
            className={[
              titleClassName,
              "type-h4 relative z-10 block !text-white [color:#fff] drop-shadow-[0_2px_14px_rgba(0,0,0,0.7)] transition-colors hover:!text-white focus-visible:!text-white",
            ].filter(Boolean).join(" ")}
          >
            {title}
          </Link>
        </div>
      </div>
    </article>
  );
}
