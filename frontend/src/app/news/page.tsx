import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { InfiniteArchivePageList } from "@/components/infinite-archive-page-list";
import { SidebarPanel } from "@/components/sidebar-panel";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { buildCategoryDateOverlayMeta, buildSeoMetadata, getNews, getPrimaryCategory, getSidebarForPath, getSiteSeo, getTagCloud, sortArchiveItems, withLoggedFallback } from "@/lib/strapi";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const siteSeo = await withLoggedFallback("news metadata site seo", () => getSiteSeo(), null);

  return buildSeoMetadata({
    title: "Новости винной индустрии",
    description: "Оперативная лента новостей, релизов, отраслевых заявлений и важных анонсов из мира вина и виноделия.",
    siteSeo,
    path: "/news",
  });
}

export default async function NewsPage() {
  const [news, sidebar, tagCloud] = await Promise.all([
    withLoggedFallback("news list", () => getNews(), []),
    withLoggedFallback("news sidebar", () => getSidebarForPath("/news"), null),
    withLoggedFallback("news tag cloud", () => getTagCloud(), []),
  ]);

  const { leadItem, pinnedItems, regularItems } = sortArchiveItems(news);
  const orderedNews = [...pinnedItems, ...regularItems];

  const buildArchiveMeta = (categories?: typeof news[number]["categories"], publishedAt?: string | null, publishedAtCustom?: string | null) => {
    const primaryCategory = getPrimaryCategory(categories);

    return buildCategoryDateOverlayMeta(
      primaryCategory ? [primaryCategory] : null,
      publishedAt,
      publishedAtCustom,
    );
  };

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <section className="min-w-0">
          <MobileSidebarBridge sidebar={sidebar} />
          <header className="border-b border-black/10 pb-8 dark:border-white/10">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Новости" }]} />
            <p className="type-caption text-emerald-700 dark:text-emerald-400">
              Новости
            </p>
            <h1 className="type-h1 mt-3">
              Оперативная лента отрасли: события, релизы и важные анонсы
            </h1>
          </header>

          <InfiniteArchivePageList
            emptyLabel="Новости пока не опубликованы"
            leadItem={leadItem ? {
              id: leadItem.documentId,
              href: `/news/${leadItem.slug}`,
              title: leadItem.title,
              excerpt: leadItem.excerpt,
              imageUrl: leadItem.cover?.url,
              imageAlt: leadItem.cover?.alternativeText ?? leadItem.title,
              meta: buildArchiveMeta(leadItem.categories, leadItem.publishedAt, leadItem.publishedAtCustom),
            } : null}
            items={orderedNews.map((item) => ({
              id: item.documentId,
              href: `/news/${item.slug}`,
              title: item.title,
              excerpt: item.excerpt,
              imageUrl: item.cover?.url,
              imageAlt: item.cover?.alternativeText ?? item.title,
              meta: buildArchiveMeta(item.categories, item.publishedAt, item.publishedAtCustom),
            }))}
          />
          <div className="mt-10 xl:hidden">
            <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} stacked mobile />
          </div>
        </section>

        <div className="hidden min-w-0 shrink-0 justify-self-end overflow-hidden xl:sticky xl:col-start-2 xl:block" style={{ top: "var(--site-header-offset-with-gap, 7rem)" }}>
          <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} />
        </div>
      </div>
    </main>
  );
}
