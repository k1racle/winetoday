"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StrapiBlock } from "@/lib/strapi";

type ImageGalleryBlockData = Extract<StrapiBlock, { __component: "blocks.image-gallery" }>;
type ImageSliderBlockData = Extract<StrapiBlock, { __component: "blocks.image-slider" }>;

type CollectionImage = NonNullable<ImageGalleryBlockData["images"]>[number];

type LightboxState = {
  images: CollectionImage[];
  index: number;
};

function CollectionHeader({ title, description }: { title?: string | null; description?: string | null }) {
  if (!title && !description) {
    return null;
  }

  return (
    <header className="space-y-3">
      {title ? <h2 className="type-h3">{title}</h2> : null}
      {description ? <p className="type-body text-zinc-600 dark:text-zinc-400">{description}</p> : null}
    </header>
  );
}

function CollectionArrow({
  direction,
  onClick,
  disabled = false,
  className = "",
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "Previous image" : "Next image"}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/90 text-zinc-900 shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-zinc-950/85 dark:text-zinc-50 dark:hover:bg-zinc-950 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 ${direction === "prev" ? "" : "rotate-180"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

function Lightbox({ state, onClose, onNext, onPrev }: { state: LightboxState | null; onClose: () => void; onNext: () => void; onPrev: () => void }) {
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!state) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight") {
        onNext();
      }

      if (event.key === "ArrowLeft") {
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [state, onClose, onNext, onPrev]);

  if (!state) {
    return null;
  }

  const image = state.images[state.index];

  if (!image) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close image viewer"
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/15 sm:right-6 sm:top-6"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {state.images.length > 1 ? (
        <>
          <CollectionArrow direction="prev" onClick={onPrev} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 border-white/15 bg-white/10 text-white hover:bg-white/15 sm:left-6" />
          <CollectionArrow direction="next" onClick={onNext} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 border-white/15 bg-white/10 text-white hover:bg-white/15 sm:right-6" />
        </>
      ) : null}

      <div
        className="relative w-full max-w-6xl"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) {
            return;
          }

          const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
          const deltaX = endX - touchStartX.current;
          touchStartX.current = null;

          if (Math.abs(deltaX) < 48 || state.images.length < 2) {
            return;
          }

          if (deltaX < 0) {
            onNext();
            return;
          }

          onPrev();
        }}
      >
        <div className="relative aspect-[16/10] max-h-[82vh] w-full overflow-hidden rounded-[28px] bg-white/5 ring-1 ring-white/10">
          <Image
            src={image.url}
            alt={image.alternativeText ?? `Image ${state.index + 1}`}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}

export function ImageGalleryBlock({ block }: { block: ImageGalleryBlockData }) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const images = block.images ?? [];

  const openLightbox = (index: number) => {
    setLightbox({ images, index });
  };

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  const showNext = useCallback(() => {
    setLightbox((current: LightboxState | null) => {
      if (!current || current.images.length < 2) {
        return current;
      }

      return {
        ...current,
        index: (current.index + 1) % current.images.length,
      };
    });
  }, []);

  const showPrev = useCallback(() => {
    setLightbox((current: LightboxState | null) => {
      if (!current || current.images.length < 2) {
        return current;
      }

      return {
        ...current,
        index: (current.index - 1 + current.images.length) % current.images.length,
      };
    });
  }, []);

  if (!images.length) {
    return null;
  }

  return (
    <>
      <section className="space-y-5">
        <CollectionHeader title={block.title} description={block.description} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <button
              key={`${block.id}-${image.url}-${index}`}
              type="button"
              onClick={() => openLightbox(index)}
              className="group relative overflow-hidden border border-black/10 bg-black/[0.02] text-left transition hover:border-emerald-700/40 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-emerald-400/40"
            >
              <Image
                src={image.url}
                alt={image.alternativeText ?? block.title ?? `Gallery image ${index + 1}`}
                width={960}
                height={720}
                sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
                className="h-72 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </section>
      <Lightbox state={lightbox} onClose={closeLightbox} onNext={showNext} onPrev={showPrev} />
    </>
  );
}

export function ImageSliderBlock({ block }: { block: ImageSliderBlockData }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const images = block.images ?? [];
  const imageCount = images.length;

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;

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
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const track = trackRef.current;

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

      setActiveIndex(nextIndex);
    };

    handleScroll();
    track.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      track.removeEventListener("scroll", handleScroll);
    };
  }, [imageCount]);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  const showNext = useCallback(() => {
    setLightbox((current: LightboxState | null) => {
      if (!current || current.images.length < 2) {
        return current;
      }

      return {
        ...current,
        index: (current.index + 1) % current.images.length,
      };
    });
  }, []);

  const showPrev = useCallback(() => {
    setLightbox((current: LightboxState | null) => {
      if (!current || current.images.length < 2) {
        return current;
      }

      return {
        ...current,
        index: (current.index - 1 + current.images.length) % current.images.length,
      };
    });
  }, []);

  if (!imageCount) {
    return null;
  }

  return (
    <>
      <section className="space-y-5">
        <CollectionHeader title={block.title} description={block.description} />
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CollectionArrow direction="prev" onClick={() => scrollToIndex((activeIndex - 1 + imageCount) % imageCount)} disabled={imageCount < 2} />
              <CollectionArrow direction="next" onClick={() => scrollToIndex((activeIndex + 1) % imageCount)} disabled={imageCount < 2} />
            </div>
            {imageCount > 1 ? (
              <p className="type-caption text-zinc-500 dark:text-zinc-400">
                {String(activeIndex + 1).padStart(2, "0")} / {String(imageCount).padStart(2, "0")}
              </p>
            ) : null}
          </div>

          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {images.map((image, index) => (
              <button
                key={`${block.id}-${image.url}-${index}`}
                type="button"
                onClick={() => setLightbox({ images, index })}
                className="group relative min-w-[88%] snap-center overflow-hidden border border-black/10 bg-black/[0.02] text-left sm:min-w-[72%] lg:min-w-[58%] dark:border-white/10 dark:bg-white/[0.03]"
              >
                <Image
                  src={image.url}
                  alt={image.alternativeText ?? block.title ?? `Slide ${index + 1}`}
                  width={1400}
                  height={900}
                  sizes="(max-width: 639px) 88vw, (max-width: 1023px) 72vw, 58vw"
                  className="h-[260px] w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-[360px]"
                />
                <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5 transition group-hover:ring-emerald-700/30 dark:ring-white/10 dark:group-hover:ring-emerald-400/30" />
              </button>
            ))}
          </div>

          {imageCount > 1 ? (
            <div className="flex flex-wrap items-center gap-2">
              {images.map((image, index) => (
                <button
                  key={`${block.id}-dot-${image.url}-${index}`}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-pressed={index === activeIndex}
                  onClick={() => scrollToIndex(index)}
                  className={index === activeIndex ? "h-2.5 w-8 rounded-full bg-emerald-700 dark:bg-emerald-400" : "h-2.5 w-2.5 rounded-full bg-black/15 transition hover:bg-black/30 dark:bg-white/20 dark:hover:bg-white/35"}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
      <Lightbox state={lightbox} onClose={closeLightbox} onNext={showNext} onPrev={showPrev} />
    </>
  );
}
