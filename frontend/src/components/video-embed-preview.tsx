"use client";

type VideoEmbedPreviewProps = {
  title: string;
  videoUrl?: string | null;
};

function resolveEmbedUrl(videoUrl?: string | null) {
  if (!videoUrl) {
    return null;
  }

  try {
    const url = new URL(videoUrl);

    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");

      if (!videoId) {
        return videoUrl;
      }

      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;
    }

    if (url.hostname.includes("youtu.be")) {
      const videoId = url.pathname.replace(/^\//, "");

      if (!videoId) {
        return videoUrl;
      }

      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;
    }

    if (url.hostname.includes("vimeo.com")) {
      const videoId = url.pathname.replace(/^\//, "");

      if (!videoId) {
        return videoUrl;
      }

      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }

    return videoUrl;
  } catch {
    return videoUrl;
  }
}

export function VideoEmbedPreview({ title, videoUrl }: VideoEmbedPreviewProps) {
  const embedUrl = resolveEmbedUrl(videoUrl);

  if (!embedUrl) {
    return null;
  }

  return (
    <div className="overflow-hidden bg-black">
      <div className="relative aspect-video w-full">
        <iframe
          src={embedUrl}
          title={title}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
}
