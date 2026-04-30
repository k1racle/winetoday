"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type VideoEmbedPreviewProps = {
  title: string;
  videoUrl: string;
  coverUrl?: string | null;
  coverAlt?: string | null;
};

function resolveEmbedUrl(videoUrl: string, autoplay = false) {
  try {
    const url = new URL(videoUrl);

    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");

      if (!videoId) {
        return videoUrl;
      }

      return `https://www.youtube.com/embed/${videoId}${autoplay ? "?autoplay=1&rel=0" : "?rel=0"}`;
    }

    if (url.hostname.includes("youtu.be")) {
      const videoId = url.pathname.replace(/^\//, "");

      if (!videoId) {
        return videoUrl;
      }

      return `https://www.youtube.com/embed/${videoId}${autoplay ? "?autoplay=1&rel=0" : "?rel=0"}`;
    }

    if (url.hostname.includes("vimeo.com")) {
      const videoId = url.pathname.replace(/^\//, "");

      if (!videoId) {
        return videoUrl;
      }

      return `https://player.vimeo.com/video/${videoId}${autoplay ? "?autoplay=1" : ""}`;
    }

    return videoUrl;
  } catch {
    return videoUrl;
  }
}

export function VideoEmbedPreview({ title, videoUrl, coverUrl, coverAlt }: VideoEmbedPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = useMemo(() => resolveEmbedUrl(videoUrl, isPlaying), [videoUrl, isPlaying]);

  return (
    <div className="overflow-hidden bg-black">
      <div className="relative aspect-video w-full">
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={title}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group relative h-full w-full overflow-hidden text-left"
            aria-label={`Воспроизвести видео: ${title}`}
          >
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={coverAlt ?? title}
                fill
                sizes="(max-width: 1024px) 100vw, 960px"
                className="object-cover transition duration-500 group-hover:scale-[1.02]"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(28,55,40,0.55),_rgba(0,0,0,0.95))]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-black/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/92 text-[#10351d] shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition duration-300 group-hover:scale-105 group-hover:bg-white">
                <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-current" aria-hidden="true">
                  <path d="M8 6.5v11l9-5.5-9-5.5Z" />
                </svg>
              </span>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <span className="type-h4 block text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">{title}</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
