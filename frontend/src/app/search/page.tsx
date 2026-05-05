import type { ReactNode } from "react";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { InfiniteArchivePageList } from "@/components/infinite-archive-page-list";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { SidebarPanel } from "@/components/sidebar-panel";
import {
  buildCategoryDateOverlayMeta,
  buildSeoMetadata,
  getArticles,
  getNews,
  getSidebarForPath,
  getSiteSeo,
  getTagCloud,
  getVideos,
  withLoggedFallback,
} from "@/lib/strapi";

export const revalidate = 120;

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string | string[];
  }>;
};

type SearchSectionProps = {
  title: string;
  emptyLabel: string;
  children: ReactNode;
};

function normalizeSearchValue(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function resolveSearchQueryParam(value?: string | string[] | null) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const firstNonEmptyValue = value.find((entry) => typeof entry === "string" && entry.trim().length > 0) ?? value[0] ?? "";
    console.warn("[search] unexpected repeated q params", { valueCount: value.length, usingValue: firstNonEmptyValue });
    return firstNonEmptyValue;
  }

  return "";
}

function nonNullable<T>(value: T | null | undefined): value is T {
  return value != null;
}

function hasDisplayName<T extends { name?: string | null }>(value: T | null | undefined): value is T & { name: string } {
  return Boolean(value?.name);
}

function hasSearchCardIdentity<T extends { documentId?: string | null; slug?: string | null; title?: string | null }>(
  item: T | null | undefined,
): item is T & { documentId: string; slug: string; title: string } {
  return Boolean(item?.documentId && item.slug && item.title);
}

function scoreMatch(values: Array<string | null | undefined>, query: string) {
  if (!query) {
    return 0;
  }

  return values.reduce((score, value, index) => {
    const normalized = value?.toLowerCase();

    if (!normalized) {
      return score;
    }

    if (normalized === query) {
      return score + 120 - index * 4;
    }

    if (normalized.startsWith(query)) {
      return score + 80 - index * 3;
    }

    if (normalized.includes(query)) {
      return score + 36 - index * 2;
    }

    return score;
  }, 0);
}

function sortByScore<T>(items: T[], pickFields: (item: T) => Array<string | null | undefined>) {
  return (query: string) =>
    [...items]
      .map((item) => ({ item, score: scoreMatch(pickFields(item), query) }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .map((entry) => entry.item);
}

function SearchSection({ title, emptyLabel, children }: SearchSectionProps) {
  return (
    <section className="space-y-5 border-t border-black/10 pt-6 first:border-t-0 first:pt-0 dark:border-white/10">
      <header className="space-y-2">
        <h2 className="type-h3">{title}</h2>
        <p className="type-small text-zinc-500 dark:text-zinc-400">{emptyLabel}</p>
      </header>
      {children}
    </section>
  );
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = (await searchParams) ?? {};
  const rawQuery = resolveSearchQueryParam(params.q).trim();
  const siteSeo = await withLoggedFallback("search metadata site seo", () => getSiteSeo(), null);

  return buildSeoMetadata({
    title: rawQuery ? `Поиск: ${rawQuery}` : "Поиск по сайту",
    description: rawQuery
      ? `Результаты поиска по запросу ${rawQuery} среди статей, новостей и видео.`
      : "Поиск по статьям, новостям и видео на сайте.",
    siteSeo,
    path: rawQuery ? `/search?q=${encodeURIComponent(rawQuery)}` : "/search",
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = (await searchParams) ?? {};
  const rawQuery = resolveSearchQueryParam(params.q).trim();
  const query = normalizeSearchValue(rawQuery);

  const [articles, news, videos, sidebar, tagCloud] = await Promise.all([
    withLoggedFallback("search articles", () => getArticles(), []),
    withLoggedFallback("search news", () => getNews(), []),
    withLoggedFallback("search videos", () => getVideos(), []),
    withLoggedFallback("search sidebar", () => getSidebarForPath("/search"), null),
    withLoggedFallback("search tag cloud", () => getTagCloud(), []),
  ]);

  const articleFields = (item: (typeof articles)[number]) => [
    item.title,
    item.excerpt,
    item.author?.name,
    ...(item.categories ?? []).filter(nonNullable).map((category) => category.name),
    ...(item.tags ?? []).map((tag) => tag.name),
  ];
  const newsFields = (item: (typeof news)[number]) => [
    item.title,
    item.excerpt,
    item.author?.name,
    item.sourceName,
    ...(item.categories ?? []).filter(nonNullable).map((category) => category.name),
    ...(item.tags ?? []).map((tag) => tag.name),
  ];
  const videoFields = (item: (typeof videos)[number]) => [
    item.title,
    item.excerpt,
    item.author?.name,
    ...(item.categories ?? []).filter(nonNullable).map((category) => category.name),
    ...(item.tags ?? []).map((tag) => tag.name),
  ];

  const matchedArticles = query ? sortByScore(articles, articleFields)(query) : [];
  const matchedNews = query ? sortByScore(news, newsFields)(query) : [];
  const matchedVideos = query ? sortByScore(videos, videoFields)(query) : [];

  const safeMatchedArticles = matchedArticles.filter(hasSearchCardIdentity);
  const safeMatchedNews = matchedNews.filter(hasSearchCardIdentity);
  const safeMatchedVideos = matchedVideos.filter(hasSearchCardIdentity);

  const hasResults = Boolean(safeMatchedArticles.length || safeMatchedNews.length || safeMatchedVideos.length);
  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <section className="min-w-0">
          <MobileSidebarBridge sidebar={sidebar} />
          <header className="border-b border-black/10 pb-8 dark:border-white/10">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Поиск" }]} />
            <p className="type-caption text-emerald-700 dark:text-emerald-400">
              Поиск
            </p>
            <h1 className="type-h1 mt-3">Поиск по сайту</h1>
            {rawQuery ? (
              <p className="type-body mt-4 text-zinc-600 dark:text-zinc-400">
                Результаты по запросу: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{rawQuery}</span>
              </p>
            ) : (
              <p className="type-body mt-4 text-zinc-600 dark:text-zinc-400">
                Ищем одновременно по статьям, новостям и видео
              </p>
            )}
          </header>

          <div className="mt-10 space-y-8">
            {!rawQuery ? (
              <div className="type-small border-b border-dashed border-black/10 pb-6 text-zinc-600 dark:border-white/10 dark:text-zinc-400">
                Введите запрос в поиске в шапке сайта
              </div>
            ) : !hasResults ? (
              <div className="type-small border-b border-dashed border-black/10 pb-6 text-zinc-600 dark:border-white/10 dark:text-zinc-400">
                По вашему запросу ничего не найдено. Попробуйте изменить формулировку
              </div>
            ) : null}

            {safeMatchedArticles.length ? (
              <SearchSection title="Статьи" emptyLabel="Найденные статьи по вашему запросу">
                <InfiniteArchivePageList
                  emptyLabel="Найденные статьи по вашему запросу"
                  items={safeMatchedArticles.map((article) => ({
                    id: article.documentId,
                    href: `/articles/${article.slug}`,
                    title: article.title,
                    excerpt: article.excerpt,
                    imageUrl: article.cover?.url,
                    imageAlt: article.cover?.alternativeText ?? article.title,
                    meta: buildCategoryDateOverlayMeta(article.categories, article.publishedAt, article.publishedAtCustom),
                  }))}
                />
              </SearchSection>
            ) : null}

            {safeMatchedNews.length ? (
              <SearchSection title="Новости" emptyLabel="Найденные новости по вашему запросу">
                <InfiniteArchivePageList
                  emptyLabel="Найденные новости по вашему запросу"
                  items={safeMatchedNews.map((item) => ({
                    id: item.documentId,
                    href: `/news/${item.slug}`,
                    title: item.title,
                    excerpt: item.excerpt,
                    imageUrl: item.cover?.url,
                    imageAlt: item.cover?.alternativeText ?? item.title,
                    meta: buildCategoryDateOverlayMeta(item.categories, item.publishedAt, item.publishedAtCustom),
                  }))}
                />
              </SearchSection>
            ) : null}

            {safeMatchedVideos.length ? (
              <SearchSection title="Видео" emptyLabel="Найденные видеоматериалы по вашему запросу">
                <InfiniteArchivePageList
                  emptyLabel="Найденные видеоматериалы по вашему запросу"
                  items={safeMatchedVideos.map((video) => ({
                    id: video.documentId,
                    href: `/videos/${video.slug}`,
                    title: video.title,
                    excerpt: video.excerpt,
                    imageUrl: video.cover?.url,
                    imageAlt: video.cover?.alternativeText ?? video.title,
                    meta: buildCategoryDateOverlayMeta(video.categories, video.publishedAt, video.publishedAtCustom),
                  }))}
                />
              </SearchSection>
            ) : null}
          </div>
          <div className="mt-10 xl:hidden">
            <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} stacked mobile />
          </div>
        </section>

        <div className="hidden w-[320px] shrink-0 overflow-hidden xl:sticky xl:col-start-2 xl:block" style={{ top: "var(--site-header-offset-with-gap, 7rem)" }}>
          <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} />
        </div>
      </div>
    </main>
  );
}
