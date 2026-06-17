import { SITE_URL, toAbsoluteSiteUrl, type GlobalSettings, type MediaAsset } from "@/lib/strapi";

const ORGANIZATION_NAME = "Виноделие Сегодня";
const DEFAULT_DESCRIPTION =
  "Современный русскоязычный портал о виноделии: новости, статьи, видео и аналитика.";

function absoluteMediaUrl(url?: string | null): string | undefined {
  if (!url) {
    return undefined;
  }

  // Uploads from Strapi should be resolved against the media origin.
  if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
    const cleanPath = url.replace(/^\/+/, "").replace(/^uploads\//, "");
    const mediaOrigin = (process.env.MEDIA_URL?.trim() || new URL("/uploads/", SITE_URL).toString()).replace(
      /\/+$/,
      "",
    );
    return `${mediaOrigin}/${cleanPath}`;
  }

  return toAbsoluteSiteUrl(url, SITE_URL);
}

function imageObject(url?: string | null, asset?: MediaAsset | null) {
  const imageUrl = absoluteMediaUrl(url ?? asset?.url);

  if (!imageUrl) {
    return undefined;
  }

  return {
    "@type": "ImageObject" as const,
    url: imageUrl,
    width: asset?.width ?? undefined,
    height: asset?.height ?? undefined,
    caption: asset?.alternativeText ?? undefined,
  };
}

function organizationReference(siteUrl: string) {
  return {
    "@type": "Organization" as const,
    "@id": `${siteUrl}/#organization`,
    name: ORGANIZATION_NAME,
  };
}

export function buildOrganizationJsonLd(settings?: GlobalSettings | null) {
  const siteUrl = toAbsoluteSiteUrl("/", SITE_URL) ?? SITE_URL;
  const logo = imageObject(settings?.logo?.url, settings?.logo);
  const sameAs =
    settings?.socialLinks?.links
      ?.map((link) => link.href?.trim())
      .filter((href): href is string => Boolean(href)) ?? [];

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: ORGANIZATION_NAME,
    alternateName: settings?.siteName ?? "Виноделие сегодня",
    url: siteUrl,
    logo,
    sameAs: sameAs.length ? sameAs : undefined,
    description: settings?.siteDescription ?? DEFAULT_DESCRIPTION,
    inLanguage: "ru",
  };
}

export function buildWebSiteJsonLd(settings?: GlobalSettings | null) {
  const siteUrl = toAbsoluteSiteUrl("/", SITE_URL) ?? SITE_URL;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings?.siteName ?? ORGANIZATION_NAME,
    url: siteUrl,
    publisher: organizationReference(siteUrl),
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    inLanguage: "ru",
  };
}

type WebPageJsonLdInput = {
  title: string;
  description?: string | null;
  path?: string;
  url?: string;
  image?: MediaAsset | string | null;
  datePublished?: string | null;
  dateModified?: string | null;
};

export function buildWebPageJsonLd({
  title,
  description,
  path,
  url,
  image,
  datePublished,
  dateModified,
}: WebPageJsonLdInput) {
  const siteUrl = toAbsoluteSiteUrl("/", SITE_URL) ?? SITE_URL;
  const pageUrl = url ?? (path ? toAbsoluteSiteUrl(path, SITE_URL) : siteUrl);
  const imageObj = typeof image === "string" ? imageObject(image) : imageObject(image?.url ?? null, image);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: description || DEFAULT_DESCRIPTION,
    url: pageUrl,
    image: imageObj,
    publisher: organizationReference(siteUrl),
    datePublished: datePublished ?? undefined,
    dateModified: dateModified ?? datePublished ?? undefined,
    inLanguage: "ru",
  };
}

type ArticleJsonLdInput = {
  type?: "Article" | "NewsArticle";
  title: string;
  description?: string | null;
  path: string;
  image?: MediaAsset | string | null;
  datePublished?: string | null;
  dateModified?: string | null;
};

export function buildArticleJsonLd({
  type = "Article",
  title,
  description,
  path,
  image,
  datePublished,
  dateModified,
}: ArticleJsonLdInput) {
  const siteUrl = toAbsoluteSiteUrl("/", SITE_URL) ?? SITE_URL;
  const pageUrl = toAbsoluteSiteUrl(path, SITE_URL) ?? `${siteUrl}${path}`;
  const imageObj = typeof image === "string" ? imageObject(image) : imageObject(image?.url ?? null, image);
  const imageUrl = imageObj?.url;

  return {
    "@context": "https://schema.org",
    "@type": type,
    headline: title,
    description: description || DEFAULT_DESCRIPTION,
    image: imageUrl ? [imageUrl] : undefined,
    author: organizationReference(siteUrl),
    publisher: organizationReference(siteUrl),
    datePublished: datePublished ?? undefined,
    dateModified: dateModified ?? datePublished ?? undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    inLanguage: "ru",
  };
}

type VideoObjectJsonLdInput = {
  title: string;
  description?: string | null;
  path: string;
  videoUrl?: string | null;
  durationMinutes?: number | null;
  image?: MediaAsset | string | null;
  datePublished?: string | null;
  dateModified?: string | null;
};

export function buildVideoObjectJsonLd({
  title,
  description,
  path,
  videoUrl,
  durationMinutes,
  image,
  datePublished,
  dateModified,
}: VideoObjectJsonLdInput) {
  const siteUrl = toAbsoluteSiteUrl("/", SITE_URL) ?? SITE_URL;
  const pageUrl = toAbsoluteSiteUrl(path, SITE_URL) ?? `${siteUrl}${path}`;
  const imageObj = typeof image === "string" ? imageObject(image) : imageObject(image?.url ?? null, image);

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description: description || DEFAULT_DESCRIPTION,
    thumbnailUrl: imageObj?.url,
    contentUrl: videoUrl ?? undefined,
    duration: durationMinutes ? `PT${durationMinutes}M` : undefined,
    uploadDate: datePublished ?? undefined,
    datePublished: datePublished ?? undefined,
    dateModified: dateModified ?? datePublished ?? undefined,
    author: organizationReference(siteUrl),
    publisher: organizationReference(siteUrl),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    inLanguage: "ru",
  };
}

type GalleryJsonLdInput = {
  title: string;
  description?: string | null;
  path: string;
  cover?: MediaAsset | string | null;
  photos?: MediaAsset[] | null;
  datePublished?: string | null;
  dateModified?: string | null;
};

export function buildGalleryJsonLd({
  title,
  description,
  path,
  cover,
  photos,
  datePublished,
  dateModified,
}: GalleryJsonLdInput) {
  const siteUrl = toAbsoluteSiteUrl("/", SITE_URL) ?? SITE_URL;
  const pageUrl = toAbsoluteSiteUrl(path, SITE_URL) ?? `${siteUrl}${path}`;
  const coverObj = typeof cover === "string" ? imageObject(cover) : imageObject(cover?.url ?? null, cover);
  const imageUrls = coverObj?.url ? [coverObj.url] : [];
  const photoObjects =
    photos
      ?.map((photo) => imageObject(photo.url, photo))
      .filter(Boolean) ?? [];

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description || DEFAULT_DESCRIPTION,
    image: imageUrls.length ? imageUrls : undefined,
    author: organizationReference(siteUrl),
    publisher: organizationReference(siteUrl),
    datePublished: datePublished ?? undefined,
    dateModified: dateModified ?? datePublished ?? undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    hasPart: photoObjects.length ? photoObjects : undefined,
    inLanguage: "ru",
  };
}
