import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CommunitySection } from "@/components/community-section";
import { ContentTags } from "@/components/content-tags";
import { RichContent } from "@/components/rich-content";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { MaterialEditButton } from "@/components/material-edit-button";
import { RelatedTags } from "@/components/related-tags";
import { SidebarPanel } from "@/components/sidebar-panel";
import { SourceLinks } from "@/components/source-links";
import { buildSeoMetadata, formatRussianDateTime, getNewsBySlug, getPrimaryCategory, getSidebarForPath, getSiteSeo, getTagCloud, withLoggedFallback } from "@/lib/strapi";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

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
    image: item.cover?.url,
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [item, sidebar, tagCloud] = await Promise.all([
    getNewsBySlug(slug),
    withLoggedFallback(
      `news sidebar for ${slug}`,
      () => getSidebarForPath(`/news/${slug}`),
      await withLoggedFallback("news fallback sidebar", () => getSidebarForPath("/news"), null),
    ),
    withLoggedFallback("news tag cloud", () => getTagCloud(), []),
  ]);

  if (!item) {
    notFound();
  }

  const relatedTags = item.tags?.length
    ? item.tags
    : tagCloud
        .filter((tag) => (tag.news_items ?? []).some((newsItem) => newsItem.slug === item.slug))
        .map((tag) => ({ slug: tag.slug, name: tag.name }));
  const primaryCategory = getPrimaryCategory(item.categories);
  const headerDate = formatRussianDateTime(item.publishedAtCustom ?? item.publishedAt) ?? "Без даты";

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <article className="min-w-0 w-full space-y-8 xl:px-[150px]">
          <MobileSidebarBridge sidebar={sidebar} />
          <header className="space-y-4">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Новости", href: "/news" }, { label: item.title }]} />
            <div className="type-caption flex flex-wrap items-center gap-3 text-zinc-500 dark:text-zinc-400">
              {primaryCategory ? <span>{primaryCategory.name}</span> : null}
              <span>{headerDate}</span>
              {item.author?.name ? <span>{item.author.name}</span> : null}
            </div>
            <h1 className="type-h1">{item.title}</h1>
            <ContentTags tags={item.tags} categories={item.categories} className="flex flex-wrap gap-x-3 gap-y-1" />
            <MaterialEditButton type="news" documentId={item.documentId} authorSlug={item.author?.slug} />
            {item.cover?.url ? (
              <>
                <Image src={item.cover.url} alt={item.cover.alternativeText ?? item.title} width={1280} height={720} sizes="100vw" className="h-auto max-h-[450px] w-full object-cover" />
                {item.coverSource ? <p className="type-caption text-zinc-500 dark:text-zinc-400">Источник: {item.coverSource}</p> : null}
              </>
            ) : null}
          </header>

          <RichContent blocks={item.content} />
          <SourceLinks sources={item.sources} className="pt-2" />
          <footer>
            <RelatedTags tags={relatedTags} title="Теги материала" />
            <CommunitySection
              contentTypeUid="api::news.news"
              targetDocumentId={item.documentId}
              targetSlug={item.slug}
              title={item.title}
              sharePath={`/news/${item.slug}`}
            />
          </footer>
          <div className="lg:hidden">
            <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} stacked mobile />
          </div>
        </article>

        <div className="hidden lg:sticky lg:block" style={{ top: "var(--site-header-offset-with-gap, 7rem)" }}>
          <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} />
        </div>
      </div>
    </main>
  );
}
