import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { DesktopSidebarSlot } from "@/components/desktop-sidebar-slot";
import { GalleryPhotoWall } from "@/components/image-collections";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { SidebarPanel } from "@/components/sidebar-panel";
import { MaterialEditButton } from "@/components/material-edit-button";
import { ContentViewTracker } from "@/components/content-view-tracker";
import { buildSeoMetadata, formatRussianDateTime, getGalleryBySlug, getPrimaryCategory, getSidebarForPath, getSiteSeo, getTagCloud, withLoggedFallback } from "@/lib/strapi";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [gallery, siteSeo] = await Promise.all([
    withLoggedFallback(`gallery metadata for ${slug}`, () => getGalleryBySlug(slug), null),
    withLoggedFallback(`gallery metadata site seo for ${slug}`, () => getSiteSeo(), null),
  ]);

  if (!gallery) {
    return {};
  }

  return buildSeoMetadata({
    title: gallery.seo?.metaTitle?.trim() || gallery.title,
    description: gallery.seo?.metaDescription?.trim() || gallery.excerpt?.trim() || gallery.title,
    seo: gallery.seo,
    siteSeo,
    path: `/gallery/${gallery.slug}`,
    image: gallery.cover,
  });
}

export default async function GalleryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [gallery, sidebar, tagCloud] = await Promise.all([
    withLoggedFallback(`gallery detail for ${slug}`, () => getGalleryBySlug(slug), null),
    withLoggedFallback(
      `gallery sidebar for ${slug}`,
      () => getSidebarForPath(`/gallery/${slug}`),
      await withLoggedFallback("gallery fallback sidebar", () => getSidebarForPath("/gallery"), null),
    ),
    withLoggedFallback("gallery tag cloud", () => getTagCloud(), []),
  ]);

  if (!gallery) {
    notFound();
  }

  const primaryCategory = getPrimaryCategory(gallery.categories);
  const headerDate = formatRussianDateTime(gallery.publishedAtCustom ?? gallery.publishedAt) ?? "Без даты";
  const photos = gallery.photos ?? [];

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <ContentViewTracker contentType="gallery" documentId={gallery.documentId} />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <article className="min-w-0 w-full space-y-8 xl:px-[150px]">
          <MobileSidebarBridge sidebar={sidebar} />
          <header className="space-y-4">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Галереи", href: "/gallery" }]} />
            <div className="type-caption flex flex-wrap items-center gap-3 text-zinc-500 dark:text-zinc-400">
              <span>{headerDate}</span>
              {primaryCategory ? <span>{primaryCategory.name}</span> : null}
              {gallery.author?.name ? <span>{gallery.author.name}</span> : null}
            </div>
            <h1 className="type-h1">{gallery.title}</h1>
            <MaterialEditButton type="gallery" documentId={gallery.documentId} authorSlug={gallery.author?.slug} />
          </header>

          {gallery.excerpt ? <div className="type-body max-w-4xl text-zinc-700 dark:text-zinc-300">{gallery.excerpt}</div> : null}

          {photos.length ? (
            <section className="space-y-4">
              <GalleryPhotoWall images={photos} title={gallery.title} />
            </section>
          ) : null}

          <div className="xl:hidden">
            <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} stacked mobile />
          </div>
        </article>

        <DesktopSidebarSlot>
          <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} />
        </DesktopSidebarSlot>
      </div>
    </main>
  );
}
