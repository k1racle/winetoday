import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";
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
import { SITE_URL, buildSeoMetadata, formatRussianDateTime, getArticleBySlug, getPrimaryCategory, getSidebarForPath, getSiteSeo, getTagCloud, withLoggedFallback } from "@/lib/strapi";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [article, siteSeo] = await Promise.all([
    getArticleBySlug(slug),
    withLoggedFallback(`article metadata site seo for ${slug}`, () => getSiteSeo(), null),
  ]);

  if (!article) {
    return {};
  }

  return buildSeoMetadata({
    title: article.seo?.metaTitle?.trim() || article.title,
    description: article.seo?.metaDescription?.trim() || article.excerpt?.trim() || article.title,
    seo: article.seo,
    siteSeo,
    path: `/articles/${article.slug}`,
    image: article.cover?.url,
  });
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [article, sidebar, tagCloud] = await Promise.all([
    getArticleBySlug(slug),
    withLoggedFallback(
      `article sidebar for ${slug}`,
      () => getSidebarForPath(`/articles/${slug}`),
      await withLoggedFallback("article fallback sidebar", () => getSidebarForPath("/articles"), null),
    ),
    withLoggedFallback("article tag cloud", () => getTagCloud(), []),
  ]);

  if (!article) {
    notFound();
  }

  const relatedTags = article.tags?.length
    ? article.tags
    : tagCloud
        .filter((tag) => (tag.articles ?? []).some((item) => item.slug === article.slug))
        .map((tag) => ({ slug: tag.slug, name: tag.name }));
  const primaryCategory = getPrimaryCategory(article.categories);
  const headerDate = formatRussianDateTime(article.publishedAtCustom ?? article.publishedAt) ?? "Без даты";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.publishedAt ?? undefined,
    author: article.author?.name
      ? {
          "@type": "Person",
          name: article.author.name,
        }
      : undefined,
    image: article.cover?.url ? [article.cover.url] : undefined,
    mainEntityOfPage: `${SITE_URL}/articles/${article.slug}`,
  };

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <Script id="article-jsonld" type="application/ld+json">
        {JSON.stringify(articleJsonLd)}
      </Script>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <article className="min-w-0 w-full space-y-8 xl:px-[150px]">
          <MobileSidebarBridge sidebar={sidebar} />
          <header className="space-y-4">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Статьи", href: "/articles" }, { label: article.title }]} />
            <div className="type-caption flex flex-wrap items-center gap-3 text-zinc-500 dark:text-zinc-400">
              {primaryCategory ? <span>{primaryCategory.name}</span> : null}
              <span>{headerDate}</span>
              {article.readingTime ? <span>{article.readingTime} мин чтения</span> : null}
              {article.author?.name ? <span>{article.author.name}</span> : null}
            </div>
            <h1 className="type-h1">{article.title}</h1>
            <ContentTags tags={article.tags} categories={article.categories} className="flex flex-wrap gap-x-3 gap-y-1" />
            <MaterialEditButton type="article" documentId={article.documentId} authorSlug={article.author?.slug} />
            {article.cover?.url ? (
              <>
                <Image src={article.cover.url} alt={article.cover.alternativeText ?? article.title} width={1280} height={720} sizes="100vw" className="h-auto max-h-[450px] w-full object-cover" />
                {article.coverSource ? <p className="type-caption text-zinc-500 dark:text-zinc-400">Источник: {article.coverSource}</p> : null}
              </>
            ) : null}
          </header>

          <RichContent blocks={article.content} />
          <SourceLinks sources={article.sources} className="pt-2" />
          <footer>
            <RelatedTags tags={relatedTags} title="Теги материала" />
            <CommunitySection
              contentTypeUid="api::article.article"
              targetDocumentId={article.documentId}
              targetSlug={article.slug}
              title={article.title}
              sharePath={`/articles/${article.slug}`}
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
