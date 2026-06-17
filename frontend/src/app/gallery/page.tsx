import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { DesktopSidebarSlot } from "@/components/desktop-sidebar-slot";
import { InfiniteArchivePageList } from "@/components/infinite-archive-page-list";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { SidebarPanel } from "@/components/sidebar-panel";
import { buildCategoryDateOverlayMeta, buildSeoMetadata, getGalleries, getPrimaryCategory, getSidebarForPath, getSiteSeo, getTagCloud, withLoggedFallback } from "@/lib/strapi";
import { buildWebPageJsonLd } from "@/lib/json-ld";
import Script from "next/script";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const siteSeo = await withLoggedFallback("gallery metadata site seo", () => getSiteSeo(), null);

  return buildSeoMetadata({
    title: "Фотогалереи о вине и виноделии",
    description: "Фотоподборки, репортажи и визуальные истории из мира вина и виноделия.",
    siteSeo,
    path: "/gallery",
  });
}

export default async function GalleryPage() {
  const [galleries, sidebar, tagCloud] = await Promise.all([
    withLoggedFallback("gallery list", () => getGalleries(), []),
    withLoggedFallback("gallery sidebar", () => getSidebarForPath("/gallery"), null),
    withLoggedFallback("gallery tag cloud", () => getTagCloud(), []),
  ]);

  const buildArchiveMeta = (
    categories?: typeof galleries[number]["categories"],
    publishedAt?: string | null,
    publishedAtCustom?: string | null,
  ) => {
    const primaryCategory = getPrimaryCategory(categories);

    return buildCategoryDateOverlayMeta(
      primaryCategory ? [primaryCategory] : null,
      publishedAt,
      publishedAtCustom,
    );
  };

  const jsonLd = buildWebPageJsonLd({
    title: "Фотогалереи о вине и виноделии",
    description: "Фотоподборки, репортажи и визуальные истории из мира вина и виноделия.",
    path: "/gallery",
  });

  return (
    <main className="mx-auto w-full max-w-[1440px] py-10">
      <Script id="gallery-archive-jsonld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <section className="min-w-0">
          <MobileSidebarBridge sidebar={sidebar} />
          <header className="border-b border-black/10 pb-8 dark:border-white/10">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Галереи" }]} />
            <div className="mt-4 h-px w-full bg-black/10 dark:bg-white/10" />
            <h1 className="type-h1 archive-page-mobile-title mt-3">
              Фотоподборки и визуальные истории
            </h1>
          </header>

          <InfiniteArchivePageList
            emptyLabel="Галереи пока не опубликованы"
            items={galleries.map((gallery) => ({
              id: gallery.documentId,
              href: `/gallery/${gallery.slug}`,
              title: gallery.title,
              excerpt: gallery.excerpt,
              imageUrl: gallery.cover?.url,
              imageAlt: gallery.cover?.alternativeText ?? gallery.title,
              meta: buildArchiveMeta(gallery.categories, gallery.publishedAt, gallery.publishedAtCustom),
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
