const SITE_URL = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1";
const MEDIA_URL = process.env.MEDIA_URL?.trim() || new URL("/uploads/", SITE_URL).toString();

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_MIME = "image/jpeg";
export const DEFAULT_OG_IMAGE_PATH = "/og-image.jpg";

export function getSiteOrigin() {
  try {
    return new URL(SITE_URL).origin;
  } catch {
    return "http://127.0.0.1";
  }
}

export function getAllowedOgImageHosts() {
  const hosts = new Set<string>(["localhost", "127.0.0.1"]);

  for (const candidate of [SITE_URL, MEDIA_URL]) {
    try {
      hosts.add(new URL(candidate).hostname);
    } catch {
      // Ignore invalid env URLs.
    }
  }

  return hosts;
}

export function normalizeOgImageSourcePath(imageUrl?: string | null) {
  if (!imageUrl?.trim()) {
    return DEFAULT_OG_IMAGE_PATH;
  }

  if (imageUrl.includes("/api/og-image")) {
    try {
      const parsed = new URL(imageUrl, getSiteOrigin());
      const existingSrc = parsed.searchParams.get("src");

      if (existingSrc) {
        return existingSrc.startsWith("/") ? existingSrc.split("?")[0] : `/${existingSrc.split("?")[0]}`;
      }
    } catch {
      // Fall through to regular normalization.
    }
  }

  try {
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return new URL(imageUrl).pathname || DEFAULT_OG_IMAGE_PATH;
    }
  } catch {
    // Fall through to relative path normalization.
  }

  const normalizedPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return normalizedPath.split("?")[0] || DEFAULT_OG_IMAGE_PATH;
}

export function resolveOgImageUpstreamUrl(src: string) {
  let path = src.trim();

  if (path.startsWith("http://") || path.startsWith("https://")) {
    path = new URL(path).pathname;
  } else {
    path = path.startsWith("/") ? path.split("?")[0] : `/${path.split("?")[0]}`;
  }

  if (!path || path === "/") {
    throw new Error("Invalid image source path");
  }

  if (path.startsWith("/uploads/")) {
    return new URL(path.replace(/^\//, ""), `${MEDIA_URL.replace(/\/+$/, "")}/`).toString();
  }

  return new URL(path, getSiteOrigin()).toString();
}

export function toOgImage(imageUrl?: string | null, siteOrigin = getSiteOrigin()) {
  const sourcePath = normalizeOgImageSourcePath(imageUrl);
  return `${siteOrigin}/api/og-image?src=${encodeURIComponent(sourcePath)}`;
}
