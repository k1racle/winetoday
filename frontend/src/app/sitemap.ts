import type { MetadataRoute } from "next";

import { SITE_URL, getArticles, getNews, getPages, getSiteSeo, getSitemapCategories, getSitemapTags, getVideos, withLoggedFallback } from "@/lib/strapi";

const DEFAULT_SITE_URL = SITE_URL;
const RESERVED_PAGE_SLUGS = new Set(["account", "api", "articles", "categories", "news", "robots.txt", "search", "sitemap.xml", "tags", "videos"]);

function normalizeDate(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteSeo = await withLoggedFallback("sitemap site seo", () => getSiteSeo(), null);

  if (siteSeo?.sitemapEnabled === false) {
    return [];
  }

  const siteUrl = siteSeo?.siteUrl?.trim() || DEFAULT_SITE_URL;
  const excludedPaths = new Set(
    (siteSeo?.sitemapExcludePaths ?? "")
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean),
  );

  const [articles, news, videos, pages, categories, tags] = await Promise.all([
    siteSeo?.sitemapIncludeArticles === false ? Promise.resolve([]) : withLoggedFallback("sitemap articles", () => getArticles(), []),
    siteSeo?.sitemapIncludeNews === false ? Promise.resolve([]) : withLoggedFallback("sitemap news", () => getNews(), []),
    siteSeo?.sitemapIncludeVideos === false ? Promise.resolve([]) : withLoggedFallback("sitemap videos", () => getVideos(), []),
    siteSeo?.sitemapIncludePages === false ? Promise.resolve([]) : withLoggedFallback("sitemap pages", () => getPages(), []),
    withLoggedFallback("sitemap categories", () => getSitemapCategories(), []),
    withLoggedFallback("sitemap tags", () => getSitemapTags(), []),
  ]);

  const publicPages = pages.filter((item) => item.slug && !RESERVED_PAGE_SLUGS.has(item.slug));

  return [
    { url: `${siteUrl}/`, changeFrequency: "daily" as const, priority: 1 },
    ...(siteSeo?.sitemapIncludeArticles === false ? [] : [{ url: `${siteUrl}/articles`, changeFrequency: "daily" as const, priority: 0.9 }]),
    ...(siteSeo?.sitemapIncludeNews === false ? [] : [{ url: `${siteUrl}/news`, changeFrequency: "daily" as const, priority: 0.9 }]),
    ...(siteSeo?.sitemapIncludeVideos === false ? [] : [{ url: `${siteUrl}/videos`, changeFrequency: "weekly" as const, priority: 0.8 }]),
    ...articles.map((item) => ({
      url: `${siteUrl}/articles/${item.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified: normalizeDate(item.publishedAtCustom ?? item.publishedAt),
    })),
    ...news.map((item) => ({
      url: `${siteUrl}/news/${item.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
      lastModified: normalizeDate(item.publishedAtCustom ?? item.publishedAt),
    })),
    ...videos.map((item) => ({
      url: `${siteUrl}/videos/${item.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      lastModified: normalizeDate(item.publishedAtCustom ?? item.publishedAt),
    })),
    ...categories.map((item) => ({
      url: `${siteUrl}/categories/${item.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...tags.map((item) => ({
      url: `${siteUrl}/tags/${item.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...publicPages.map((item) => ({
      url: `${siteUrl}/${item.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ].filter((item) => {
    try {
      const pathname = new URL(item.url).pathname;
      return !excludedPaths.has(pathname);
    } catch {
      return true;
    }
  });
}
