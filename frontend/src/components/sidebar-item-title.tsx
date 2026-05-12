"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

type SidebarItemTitleProps = {
  title: string;
  materialLabel?: string | null;
  className?: string;
  badgeClassName?: string;
  /** Gap (in px) between title text and badge, used in width math for 3rd line. */
  gapPx?: number;
};

function normalizeMaterialLabel(value?: string | null): "exclusive" | "video" | "" {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "exclusive" || normalized === "video") {
    return normalized;
  }

  return "";
}

function getMaterialBadgeLabel(normalizedMaterialLabel: "exclusive" | "video" | "") {
  if (normalizedMaterialLabel === "exclusive") {
    return "Эксклюзив";
  }

  if (normalizedMaterialLabel === "video") {
    return "Видео";
  }

  return null;
}

function makeCanvasTextMeasurer(font: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.font = font;

  const measure = (value: string) => {
    const metrics = context.measureText(value);
    return metrics.width;
  };

  return measure;
}

function ellipsize(value: string) {
  const trimmed = value.trimEnd();
  return trimmed ? `${trimmed}…` : "…";
}

function wrapLinesByWords(options: {
  text: string;
  widths: number[];
  measureText: (value: string) => number;
}) {
  // We intentionally use word-based wrapping for stable results.
  const trimmedText = options.text.trim();
  const words = trimmedText ? trimmedText.split(/\s+/u).filter(Boolean) : [];

  const lines: string[] = [];
  let wordIndex = 0;

  for (let lineIndex = 0; lineIndex < options.widths.length; lineIndex += 1) {
    const maxWidth = options.widths[lineIndex] ?? 0;
    let line = "";

    while (wordIndex < words.length) {
      const nextWord = words[wordIndex]!;
      const next = line ? `${line} ${nextWord}` : nextWord;

      if (options.measureText(next) <= maxWidth || !line) {
        line = next;
        wordIndex += 1;
        continue;
      }

      break;
    }

    lines.push(line);
  }

  return { lines, didConsumeAllWords: wordIndex >= words.length };
}

function clampToThreeLines(container: HTMLElement) {
  // Ensure hard cap at 3 lines even if our canvas approximation differs a bit.
  container.style.display = "-webkit-box";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (container.style as any).WebkitBoxOrient = "vertical";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (container.style as any).WebkitLineClamp = "3";
  container.style.overflow = "hidden";
}

function fitsInThreeLines(options: {
  title: string;
  containerWidth: number;
  thirdLineWidth: number;
  measureText: (value: string) => number;
}) {
  if (options.containerWidth <= 0 || options.thirdLineWidth <= 0) {
    return true;
  }

  const { didConsumeAllWords } = wrapLinesByWords({
    text: options.title,
    widths: [options.containerWidth, options.containerWidth, options.thirdLineWidth],
    measureText: options.measureText,
  });

  return didConsumeAllWords;
}

function truncateTitleToThreeLines(options: {
  title: string;
  containerWidth: number;
  thirdLineWidth: number;
  measureText: (value: string) => number;
}) {
  const cleanTitle = options.title ?? "";

  if (
    fitsInThreeLines({
      title: cleanTitle,
      containerWidth: options.containerWidth,
      thirdLineWidth: options.thirdLineWidth,
      measureText: options.measureText,
    })
  ) {
    return cleanTitle;
  }

  let low = 0;
  let high = cleanTitle.length;
  let best = "";

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = ellipsize(cleanTitle.slice(0, mid));

    if (
      fitsInThreeLines({
        title: candidate,
        containerWidth: options.containerWidth,
        thirdLineWidth: options.thirdLineWidth,
        measureText: options.measureText,
      })
    ) {
      best = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best || ellipsize("");
}

export function SidebarItemTitle({
  title,
  materialLabel,
  className,
  badgeClassName,
  gapPx = 8,
}: SidebarItemTitleProps) {
  const normalizedMaterialLabel = useMemo(() => normalizeMaterialLabel(materialLabel), [materialLabel]);
  const badgeText = useMemo(() => getMaterialBadgeLabel(normalizedMaterialLabel), [normalizedMaterialLabel]);

  const containerRef = useRef<HTMLSpanElement | null>(null);
  const titleRef = useRef<HTMLSpanElement | null>(null);
  const badgeRef = useRef<HTMLSpanElement | null>(null);
  const [renderTitle, setRenderTitle] = useState(title);
  const [sizes, setSizes] = useState<{ containerWidth: number; badgeWidth: number } | null>(null);

  useEffect(() => {
    // Keep SSR output stable until we can measure.
    setRenderTitle(title);
  }, [title]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    clampToThreeLines(container);
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    clampToThreeLines(container);
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const readSizes = () => {
      const containerWidth = container.getBoundingClientRect().width;
      const badgeWidth = badgeRef.current?.getBoundingClientRect().width ?? 0;
      setSizes({ containerWidth, badgeWidth });
    };

    readSizes();

    const resizeObserver = new ResizeObserver(() => {
      readSizes();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [badgeText]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container || !sizes) {
      return;
    }

    const computed = window.getComputedStyle(container);
    const font = computed.font;
    const measureText = makeCanvasTextMeasurer(font);

    if (!measureText) {
      return;
    }

    const gap = badgeText ? gapPx : 0;
    const thirdLineWidth = Math.max(0, sizes.containerWidth - (badgeText ? sizes.badgeWidth : 0) - gap);

    const nextTitle = truncateTitleToThreeLines({
      title,
      containerWidth: sizes.containerWidth,
      thirdLineWidth,
      measureText,
    });

    setRenderTitle(nextTitle);
  }, [title, badgeText, sizes]);

  return (
    <span
      ref={containerRef}
      className={className}
      // Ensure we measure the real available width, not just the inline content width.
      style={{ display: "block", width: "100%" }}
    >
      <span ref={titleRef}>{renderTitle}</span>
      {badgeText ? (
        <>
          <span
            ref={badgeRef}
            className={badgeClassName ? `${badgeClassName} whitespace-nowrap` : "whitespace-nowrap"}
            style={{ marginLeft: gapPx - 1 }}
          >
            {badgeText}
          </span>
        </>
      ) : null}
    </span>
  );
}
