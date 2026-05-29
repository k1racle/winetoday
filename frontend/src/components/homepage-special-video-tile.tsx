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
  imageClassName?: string;
  titleClassName?: string;
  imageSizes?: string;
  contentClassName?: string;
  compactPlayButton?: boolean;
  hideTitle?: boolean;
  titleBelow?: boolean;
  bodyClassName?: string;
  bodyWrapperClassName?: string;
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
  imageClassName,
  titleClassName,
  imageSizes,
  contentClassName,
  compactPlayButton,
  hideTitle,
  titleBelow,
  bodyClassName,
  bodyWrapperClassName,
}: HomepageSpecialVideoTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const embedUrl = useMemo(() => resolvePreviewEmbedUrl(videoUrl), [videoUrl]);
  const shouldAutoplay = isHovered && Boolean(embedUrl);
  const overlayPaddingClassName = contentClassName ?? "p-4";
  const titleBelowPaddingClassName = bodyWrapperClassName || bodyClassName ? [bodyWrapperClassName, bodyClassName].filter(Boolean).join(" ") : "px-5 py-4 sm:px-6";

  return (
    <article
      className={[
        "group relative overflow-hidden border border-black/10 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.04]",
        className,
      ].filter(Boolean).join(" ")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className={["relative aspect-video w-full overflow-hidden bg-black", mediaClassName].filter(Boolean).join(" ")}>
        <Link href={href} aria-label={title} className="block h-full w-full">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={coverAlt ?? title}
              fill
              sizes={imageSizes ?? "(max-width: 768px) 100vw, 50vw"}
              className={["transition duration-500 group-hover:scale-[1.02]", imageClassName ?? "object-cover"].join(" ")}
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

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className={[
            "flex items-center justify-center rounded-full bg-emerald-950/55 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition duration-300 group-hover:scale-105 group-hover:bg-emerald-950/65",
            compactPlayButton ? "h-[56px] w-[56px] sm:h-[64px] sm:w-[64px] xl:h-14 xl:w-14" : "h-[80px] w-[80px]",
          ].join(" ")}>
            <svg viewBox="0 0 24 24" className={["ml-1", compactPlayButton ? "h-6 w-6 sm:h-7 sm:w-7 xl:h-6 xl:w-6" : "h-10 w-10"].join(" ")} aria-hidden="true">
              <path d="M8 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
            </svg>
          </span>
        </div>
        <div className={["absolute inset-x-0 bottom-0 z-20 text-white", overlayPaddingClassName].filter(Boolean).join(" ")}>
          {meta?.length ? (
            <ArchiveOverlayMeta itemId={href} meta={meta} />
          ) : null}
          {!hideTitle && !titleBelow ? (
            <h3 className={[
              "mt-3 text-[#fff]",
              titleClassName ?? "font-[Lato,var(--font-inter),system-ui,sans-serif] text-[18px] font-bold leading-[1.25]",
            ].join(" ")}>
              <Link href={href} className="pointer-events-auto block transition hover:text-emerald-200">
                {title}
              </Link>
            </h3>
          ) : null}
        </div>
      </div>
      {!hideTitle && titleBelow ? (
        <div className={titleBelowPaddingClassName}>
          <h3 className={[
            "text-[#0d3132] dark:text-white",
            titleClassName ?? "font-[Lato,var(--font-inter),system-ui,sans-serif] text-[18px] font-bold leading-[1.25]",
          ].join(" ")}>
            <Link href={href} className="block transition hover:text-emerald-700 dark:hover:text-emerald-200">
              {title}
            </Link>
          </h3>
        </div>
      ) : null}
    </article>
  );
}
