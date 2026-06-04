import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CommunitySection } from "@/components/community-section";
import { DesktopSidebarSlot } from "@/components/desktop-sidebar-slot";
import { RichContent } from "@/components/rich-content";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { MaterialEditButton } from "@/components/material-edit-button";
import { RelatedTags } from "@/components/related-tags";
import { SidebarPanel } from "@/components/sidebar-panel";
import { SourceLinks } from "@/components/source-links";
import { ContentViewTracker } from "@/components/content-view-tracker";
import { buildSeoMetadata, formatRussianDateTime, getNews, getNewsBySlug, getPrimaryCategory, getSidebarForPath, getSiteSeo, getTagCloud, type NewsSummary, withLoggedFallback } from "@/lib/strapi";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getPublishedTimestamp(item: Pick<NewsSummary, "publishedAtCustom" | "publishedAt">) {
  const publishedValue = item.publishedAtCustom ?? item.publishedAt;

  if (!publishedValue) {
    return Number.NEGATIVE_INFINITY;
  }

  const timestamp = new Date(publishedValue).getTime();

  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [item, siteSeo] = await Promise.all([
    getNewsBySlug(slug),
    withLoggedFallback(`news metadata site seo for ${slug}`, () => getSiteSeo(), null),
  ]);

  if (!item) {
    return {};
  }

  return buildSeoMetadata({
    title: item.seo?.metaTitle?.trim() || item.title,
    description: item.seo?.metaDescription?.trim() || item.excerpt?.trim() || item.title,
    seo: item.seo,
    siteSeo,
    path: `/news/${item.slug}`,
    image: item.cover,
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [item, sidebar, tagCloud, news] = await Promise.all([
    getNewsBySlug(slug),
    withLoggedFallback(
      `news sidebar for ${slug}`,
      () => getSidebarForPath(`/news/${slug}`),
      await withLoggedFallback("news fallback sidebar", () => getSidebarForPath("/news"), null),
    ),
    withLoggedFallback("news tag cloud", () => getTagCloud(), []),
    withLoggedFallback("news related items", () => getNews(), []),
  ]);

  if (!item) {
    notFound();
  }

  const relatedTags = item.tags?.length
    ? item.tags
    : tagCloud
        .filter((tag) => (tag.news_items ?? []).some((newsItem) => newsItem.slug === item.slug))
        .map((tag) => ({ slug: tag.slug, name: tag.name }));
  const currentCategorySlugs = new Set(
    (item.categories ?? [])
      .map((category) => category?.slug?.trim())
      .filter((slug): slug is string => Boolean(slug)),
  );
  const relatedNews = news
    .filter((newsItem) => newsItem.slug !== item.slug)
    .map((newsItem) => {
      const matchingCategories = (newsItem.categories ?? []).reduce((count, category) => {
        const categorySlug = category?.slug?.trim();

        if (!categorySlug || !currentCategorySlugs.has(categorySlug)) {
          return count;
        }

        return count + 1;
      }, 0);

      return {
        ...newsItem,
        matchingCategories,
        publishedTimestamp: getPublishedTimestamp(newsItem),
      };
    })
    .sort(
      (left, right) =>
        right.matchingCategories - left.matchingCategories ||
        right.publishedTimestamp - left.publishedTimestamp,
    )
    .slice(0, 3);
  const primaryCategory = getPrimaryCategory(item.categories);
  const headerDate = formatRussianDateTime(item.publishedAtCustom ?? item.publishedAt) ?? "Без даты";

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <ContentViewTracker contentType="news" documentId={item.documentId} />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <article className="min-w-0 w-full space-y-8 xl:px-[150px]">
          <MobileSidebarBridge sidebar={sidebar} />
          <header className="space-y-4">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Новости", href: "/news" }]} />
            <div className="type-caption flex flex-wrap items-center gap-3 text-zinc-500 dark:text-zinc-400">
              <span>{headerDate}</span>
              {primaryCategory ? <span>{primaryCategory.name}</span> : null}
              {item.author?.name ? <span>{item.author.name}</span> : null}
            </div>
            <h1 className="type-h1 archive-page-mobile-title">{item.title}</h1>
            <MaterialEditButton type="news" documentId={item.documentId} authorSlug={item.author?.slug} />
            {item.cover?.url ? (
              <>
                <Image src={item.cover.url} alt={item.cover.alternativeText ?? item.title} width={1280} height={720} sizes="100vw" className="h-auto w-full object-cover" />
                {item.coverSource ? <p className="type-caption text-zinc-500 dark:text-zinc-400">Источник: {item.coverSource}</p> : null}
              </>
            ) : null}
          </header>

          <RichContent blocks={item.content} paragraphLineHeightClassName="leading-6" />
          <SourceLinks sources={item.sources} className="pt-2" />
          <footer>
            <RelatedTags tags={relatedTags} title="Теги материала" />
            <CommunitySection
              contentTypeUid="api::news.news"
              targetDocumentId={item.documentId}
              targetSlug={item.slug}
              title={item.title}
              sharePath={`/news/${item.slug}`}
              afterShareContent={
                relatedNews.length ? (
                  <section className="space-y-4">
                    <h3 className="text-[18px] font-semibold text-foreground dark:text-white">
                      Читайте также
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {relatedNews.map((relatedItem) => (
                        <article
                          key={relatedItem.documentId}
                          className="flex h-full flex-col overflow-hidden border border-black/10 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.04]"
                        >
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                            <Link href={`/news/${relatedItem.slug}`} aria-label={relatedItem.title} className="block h-full">
                              {relatedItem.cover?.url ? (
                                <Image
                                  src={relatedItem.cover.url}
                                  alt={relatedItem.cover.alternativeText ?? relatedItem.title}
                                  fill
                                  sizes="(min-width: 1280px) 240px, (min-width: 768px) 50vw, 100vw"
                                  className="object-cover"
                                />
                              ) : null}
                            </Link>
                          </div>
                          <div className="p-4">
                            <p className="type-body-sm text-[#0d3132] dark:text-white">
                              <Link href={`/news/${relatedItem.slug}`} className="transition hover:text-emerald-700 dark:hover:text-emerald-200">
                                {relatedItem.title}
                              </Link>
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null
              }
            />
          </footer>
          <div className="xl:hidden">
            <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} stacked mobile archiveBlockInnerWidthClassName="w-full" />
          </div>
        </article>

        <DesktopSidebarSlot>
          <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} />
        </DesktopSidebarSlot>
      </div>
    </main>
  );
}
