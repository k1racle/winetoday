"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const [sidebarHeight, setSidebarHeight] = useState<number | null>(null);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  const leadVideo = videos[0] ?? null;
  const secondaryVideos = useMemo(() => videos.slice(1), [videos]);

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

  const scrollToMobileIndex = useCallback((index: number) => {
    const track = mobileTrackRef.current;

    if (!track) {
      return;
    }

    const item = track.children[index] as HTMLElement | undefined;

    if (!item) {
      return;
    }

    track.scrollTo({
      left: item.offsetLeft - track.offsetLeft,
      behavior: "smooth",
    });

    setMobileActiveIndex(index);
  }, []);

  useEffect(() => {
    const track = mobileTrackRef.current;

    if (!track) {
      return;
    }

    const handleScroll = () => {
      const items = Array.from(track.children) as HTMLElement[];

      if (!items.length) {
        return;
      }

      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let nextIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      items.forEach((item, index) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(itemCenter - trackCenter);

        if (distance < minDistance) {
          minDistance = distance;
          nextIndex = index;
        }
      });

      setMobileActiveIndex(nextIndex);
    };

    handleScroll();
    track.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      track.removeEventListener("scroll", handleScroll);
    };
  }, [videos]);

  useEffect(() => {
    setMobileActiveIndex(0);
  }, [videos]);

  if (!leadVideo) {
    return null;
  }

  return (
    <>
      <div className="space-y-3 xl:hidden">
        <div
          ref={mobileTrackRef}
          className="mx-auto flex w-[48vw] max-w-[180px] snap-x snap-mandatory overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-[56vw] sm:max-w-[220px]"
        >
          {videos.map((video) => (
            <div key={video.documentId} className="min-w-full shrink-0 snap-center px-1 sm:px-2">
              <HomepageSpecialVideoTile
                href={video.href}
                title={video.title}
                coverUrl={video.cover?.url ?? null}
                coverAlt={video.cover?.alternativeText ?? video.title}
                videoUrl={video.videoUrl}
                meta={video.meta}
                className="h-full w-full"
                contentClassName="p-2 sm:p-4"
                compactPlayButton
                titleBelow
                bodyClassName="px-2 py-1.5 sm:px-4 sm:py-3"
                titleClassName="line-clamp-2 text-[12px] font-medium leading-[1.25] sm:text-[15px] sm:leading-[1.4]"
                imageSizes="100vw"
              />
            </div>
          ))}
        </div>

        {videos.length > 1 ? (
          <div className="flex items-center justify-center gap-2">
            {videos.map((video, index) => (
              <button
                key={`${video.documentId}-dot`}
                type="button"
                aria-label={`Go to video slide ${index + 1}`}
                aria-pressed={index === mobileActiveIndex}
                onClick={() => scrollToMobileIndex(index)}
                className={index === mobileActiveIndex ? "h-2.5 w-8 rounded-full bg-emerald-700 dark:bg-emerald-400" : "h-2.5 w-2.5 rounded-full bg-black/15 transition hover:bg-black/30 dark:bg-white/20 dark:hover:bg-white/35"}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="hidden xl:grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] xl:items-start">
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
        ) : null}
      </div>
    </>
  );
}
