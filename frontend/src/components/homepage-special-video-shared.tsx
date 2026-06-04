export type HomepageSpecialVideoItem = {
  documentId: string;
  href: string;
  title: string;
  cover?: { url?: string | null; alternativeText?: string | null } | null;
  videoUrl?: string | null;
  duration?: number | null;
};

export function formatVideoDurationLabel(durationMinutes?: number | null) {
  if (!durationMinutes || durationMinutes < 1) {
    return null;
  }

  const minutes = Math.floor(durationMinutes);

  return `${String(minutes).padStart(2, "0")}:00`;
}

export function resolvePreviewEmbedUrl(videoUrl?: string | null) {
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

export function VideoPlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M8 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
    </svg>
  );
}

export function VideoDurationBadge({ durationMinutes }: { durationMinutes?: number | null }) {
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

export function VideoSectionLabel() {
  return (
    <span className="inline-flex items-center gap-1 bg-[#0c3f24] px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-[0.04em] text-white">
      <VideoPlayIcon className="h-2.5 w-2.5" />
      Видео
    </span>
  );
}
