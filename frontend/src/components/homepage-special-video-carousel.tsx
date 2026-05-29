"use client";

import type { OverlayMetaItem } from "@/components/archive-overlay-meta";
import { HomepageSpecialVideoDesktop } from "@/components/homepage-special-video-desktop";
import { HomepageSpecialVideoMobile } from "@/components/homepage-special-video-mobile";

type HomepageSpecialVideoCarouselProps = {
  videos: {
    documentId: string;
    href: string;
    title: string;
    cover?: { url?: string | null; alternativeText?: string | null } | null;
    videoUrl?: string | null;
    duration?: number | null;
    meta: OverlayMetaItem[];
  }[];
};

export function HomepageSpecialVideoCarousel({ videos }: HomepageSpecialVideoCarouselProps) {
  if (!videos.length) {
    return null;
  }

  const playlist = videos.map(({ documentId, href, title, cover, videoUrl, duration }) => ({
    documentId,
    href,
    title,
    cover,
    videoUrl,
    duration,
  }));

  return (
    <>
      <HomepageSpecialVideoMobile videos={playlist} />
      <HomepageSpecialVideoDesktop videos={playlist} />
    </>
  );
}
