import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { DesktopSidebarSlot } from "@/components/desktop-sidebar-slot";
import { InfiniteArchivePageList } from "@/components/infinite-archive-page-list";
import { SidebarPanel } from "@/components/sidebar-panel";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { buildCategoryDateOverlayMeta, buildSeoMetadata, getArticles, getPrimaryCategory, getSidebarForPath, getSiteSeo, getTagCloud, sortArchiveItems, withLoggedFallback } from "@/lib/strapi";
import { buildWebPageJsonLd } from "@/lib/json-ld";
import { articlesFaqJsonLd } from "@/lib/faq-data";
import Script from "next/script";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const siteSeo = await withLoggedFallback("articles metadata site seo", () => getSiteSeo(), null);

  return buildSeoMetadata({
    title: "Статьи о вине и виноделии",
    description: "Аналитика, интервью, обзоры регионов и большие редакционные материалы о российском и мировом виноделии.",
    siteSeo,
    path: "/articles",
  });
}

export default async function ArticlesPage() {
  const [articles, sidebar, tagCloud] = await Promise.all([
    withLoggedFallback("articles list", () => getArticles(), []),
    withLoggedFallback("articles sidebar", () => getSidebarForPath("/articles"), null),
    withLoggedFallback("articles tag cloud", () => getTagCloud(), []),
  ]);
  const { leadItem, pinnedItems, regularItems } = sortArchiveItems(articles);
  const orderedArticles = [...pinnedItems, ...regularItems];

  const buildArchiveMeta = (categories?: typeof articles[number]["categories"], publishedAt?: string | null, publishedAtCustom?: string | null) => {
    const primaryCategory = getPrimaryCategory(categories);

    return buildCategoryDateOverlayMeta(
      primaryCategory ? [primaryCategory] : null,
      publishedAt,
      publishedAtCustom,
    );
  };

  const jsonLd = buildWebPageJsonLd({
    title: "Статьи о вине и виноделии",
    description: "Аналитика, интервью, обзоры регионов и большие редакционные материалы о российском и мировом виноделии.",
    path: "/articles",
  });

  return (
    <main className="mx-auto w-full max-w-[1440px] py-10">
      <Script id="articles-archive-jsonld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>
      <Script id="articles-faq-jsonld" type="application/ld+json">
        {JSON.stringify(articlesFaqJsonLd)}
      </Script>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <section className="min-w-0">
          <MobileSidebarBridge sidebar={sidebar} />
          <header className="border-b border-black/10 pb-8 dark:border-white/10">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Статьи" }]} />
            <div className="mt-4 h-px w-full bg-black/10 dark:bg-white/10" />
            <h1 className="type-h1 archive-page-mobile-title mt-3">
              Аналитика, регионы, интервью и большие редакционные материалы
            </h1>
          </header>

          <InfiniteArchivePageList
            emptyLabel="Материалы пока не опубликованы"
            leadItem={leadItem ? {
              id: leadItem.documentId,
              href: `/articles/${leadItem.slug}`,
              title: leadItem.title,
              excerpt: leadItem.excerpt,
              imageUrl: leadItem.cover?.url,
              imageAlt: leadItem.cover?.alternativeText ?? leadItem.title,
              meta: buildArchiveMeta(leadItem.categories, leadItem.publishedAt, leadItem.publishedAtCustom),
            } : null}
            items={orderedArticles.map((article) => ({
              id: article.documentId,
              href: `/articles/${article.slug}`,
              title: article.title,
              excerpt: article.excerpt,
              imageUrl: article.cover?.url,
              imageAlt: article.cover?.alternativeText ?? article.title,
              meta: buildArchiveMeta(article.categories, article.publishedAt, article.publishedAtCustom),
            }))}
          />
          <div className="mt-10 xl:hidden">
            <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} stacked mobile />
          </div>
        </section>

        <DesktopSidebarSlot>
          <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} />
        </DesktopSidebarSlot>
      </div>
    </main>
  );
}
