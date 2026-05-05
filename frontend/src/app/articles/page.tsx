import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { InfiniteArchivePageList } from "@/components/infinite-archive-page-list";
import { SidebarPanel } from "@/components/sidebar-panel";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { buildCategoryDateOverlayMeta, buildSeoMetadata, getArticles, getPrimaryCategory, getSidebarForPath, getSiteSeo, getTagCloud, sortArchiveItems, withLoggedFallback } from "@/lib/strapi";

export const revalidate = 300;

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

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <section className="min-w-0">
          <MobileSidebarBridge sidebar={sidebar} />
          <header className="border-b border-black/10 pb-8 dark:border-white/10">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Статьи" }]} />
            <p className="type-caption text-emerald-700 dark:text-emerald-400">
              Статьи
            </p>
            <h1 className="type-h1 mt-3">
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

        <div className="hidden w-[320px] min-w-0 shrink-0 overflow-hidden xl:sticky xl:col-start-2 xl:block" style={{ top: "var(--site-header-offset-with-gap, 7rem)" }}>
          <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} />
        </div>
      </div>
    </main>
  );
}
