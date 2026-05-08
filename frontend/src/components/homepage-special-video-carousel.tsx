"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

export function HomepageSpecialVideoCarousel({ videos }: HomepageSpecialVideoCarouselProps) {
  const leadVideoRef = useRef<HTMLDivElement | null>(null);
  const [sidebarHeight, setSidebarHeight] = useState<number | null>(null);

  const leadVideo = videos[0] ?? null;
  const secondaryVideos = useMemo(() => videos.slice(1), [videos]);
  // TEMP: on mobile/tablet we intentionally show only 3 videos total until the smaller-screen layout is finalized.
  const mobileSecondaryVideos = useMemo(() => secondaryVideos.slice(0, 2), [secondaryVideos]);

  useEffect(() => {
    const leadVideoElement = leadVideoRef.current;

    if (!leadVideoElement) {
      return;
    }

    const updateSidebarHeight = () => {
      setSidebarHeight(leadVideoElement.getBoundingClientRect().height);
    };

    updateSidebarHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateSidebarHeight();
    });

    resizeObserver.observe(leadVideoElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [leadVideo]);

  if (!leadVideo) {
    return null;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] xl:items-start">
      <div ref={leadVideoRef}>
        <HomepageSpecialVideoTile
          href={leadVideo.href}
          title={leadVideo.title}
          coverUrl={leadVideo.cover?.url ?? null}
          coverAlt={leadVideo.cover?.alternativeText ?? leadVideo.title}
          videoUrl={leadVideo.videoUrl}
          meta={leadVideo.meta}
          titleBelow
          bodyClassName="p-5 sm:p-6"
          titleClassName="type-h3"
          imageSizes="(max-width: 1279px) 100vw, 66vw"
        />
      </div>

      {secondaryVideos.length ? (
        <>
          <div className="grid gap-4 xl:hidden">
            {mobileSecondaryVideos.map((video) => (
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
                bodyClassName="px-4 py-3"
              />
            ))}
          </div>

          <div
            className="hidden xl:block xl:overflow-y-auto xl:pr-2"
            style={sidebarHeight ? { maxHeight: sidebarHeight } : undefined}
          >
            <div className="grid gap-4">
              {secondaryVideos.map((video) => (
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
                  bodyClassName="px-4 py-3"
                />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
