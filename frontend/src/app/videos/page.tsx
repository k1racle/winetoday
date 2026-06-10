import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { DesktopSidebarSlot } from "@/components/desktop-sidebar-slot";
import { InfiniteArchivePageList } from "@/components/infinite-archive-page-list";
import { SidebarPanel } from "@/components/sidebar-panel";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { buildCategoryDateOverlayMeta, buildSeoMetadata, getPrimaryCategory, getSidebarForPath, getSiteSeo, getTagCloud, getVideos, sortArchiveItems, withLoggedFallback } from "@/lib/strapi";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const siteSeo = await withLoggedFallback("videos metadata site seo", () => getSiteSeo(), null);

  return buildSeoMetadata({
    title: "Видео о вине и виноделии",
    description: "Интервью, репортажи, записи дискуссий и видеоматериалы о современной винной индустрии.",
    siteSeo,
    path: "/videos",
  });
}

export default async function VideosPage() {
  const [videos, sidebar, tagCloud] = await Promise.all([
    withLoggedFallback("videos list", () => getVideos(), []),
    withLoggedFallback("videos sidebar", () => getSidebarForPath("/videos"), null),
    withLoggedFallback("videos tag cloud", () => getTagCloud(), []),
  ]);
  const { leadItem, pinnedItems, regularItems } = sortArchiveItems(videos);
  const orderedVideos = [...pinnedItems, ...regularItems];

  const buildArchiveMeta = (categories?: typeof videos[number]["categories"], publishedAt?: string | null, publishedAtCustom?: string | null) => {
    const primaryCategory = getPrimaryCategory(categories);

    return buildCategoryDateOverlayMeta(
      primaryCategory ? [primaryCategory] : null,
      publishedAt,
      publishedAtCustom,
    );
  };

  return (
    <main className="mx-auto w-full max-w-[1440px] py-10">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <section className="min-w-0">
          <MobileSidebarBridge sidebar={sidebar} />
          <header className="border-b border-black/10 pb-8 dark:border-white/10">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Видео" }]} />
            <div className="mt-4 h-px w-full bg-black/10 dark:bg-white/10" />
            <h1 className="type-h1 archive-page-mobile-title mt-3">
              Интервью, репортажи и видеоматериалы о современной винной индустрии
            </h1>
          </header>

          <InfiniteArchivePageList
            emptyLabel="Видеоматериалы пока не опубликованы"
            leadItem={leadItem ? {
              id: leadItem.documentId,
              href: `/videos/${leadItem.slug}`,
              title: leadItem.title,
              excerpt: leadItem.excerpt,
              imageUrl: leadItem.cover?.url,
              imageAlt: leadItem.cover?.alternativeText ?? leadItem.title,
              meta: buildArchiveMeta(leadItem.categories, leadItem.publishedAt, leadItem.publishedAtCustom),
            } : null}
            items={orderedVideos.map((video) => ({
              id: video.documentId,
              href: `/videos/${video.slug}`,
              title: video.title,
              excerpt: video.excerpt,
              imageUrl: video.cover?.url,
              imageAlt: video.cover?.alternativeText ?? video.title,
              meta: buildArchiveMeta(video.categories, video.publishedAt, video.publishedAtCustom),
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
