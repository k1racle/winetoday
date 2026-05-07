import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { DesktopSidebarSlot } from "@/components/desktop-sidebar-slot";
import { InfiniteArchivePageList } from "@/components/infinite-archive-page-list";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { SidebarPanel } from "@/components/sidebar-panel";
import { buildCategoryDateOverlayMeta, buildSeoMetadata, getCategoryPageBySlug, getSidebarForPath, getSiteSeo, getTagCloud, withLoggedFallback } from "@/lib/strapi";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [categoryPage, siteSeo] = await Promise.all([
    getCategoryPageBySlug(slug),
    withLoggedFallback(`category metadata site seo for ${slug}`, () => getSiteSeo(), null),
  ]);

  if (!categoryPage) {
    return {};
  }

  return buildSeoMetadata({
    title: `Рубрика: ${categoryPage.name}`,
    description: `Подборка материалов по рубрике ${categoryPage.name}: новости, статьи и видео.`,
    seo: categoryPage.seo,
    siteSeo,
    path: `/categories/${categoryPage.slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [categoryPage, sidebar, tagCloud] = await Promise.all([
    getCategoryPageBySlug(slug),
    withLoggedFallback(`category sidebar for ${slug}`, () => getSidebarForPath(`/categories/${slug}`), null),
    withLoggedFallback(`category tag cloud for ${slug}`, () => getTagCloud(), []),
  ]);

  if (!categoryPage) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <section className="min-w-0">
          <MobileSidebarBridge sidebar={sidebar} />
          <header className="border-b border-black/10 pb-8 dark:border-white/10">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Рубрики" }]} />
            <p className="type-caption text-emerald-700 dark:text-emerald-400">Рубрика</p>
            <h1 className="type-h1 mt-3">{categoryPage.name}</h1>
          </header>

          <InfiniteArchivePageList
            emptyLabel="В этой рубрике пока нет материалов"
            items={categoryPage.items.map((item) => ({
              id: `${item.kind}-${item.documentId}`,
              href: item.href,
              title: item.title,
              excerpt: item.excerpt,
              imageUrl: item.cover?.url,
              imageAlt: item.cover?.alternativeText ?? item.title,
              meta: buildCategoryDateOverlayMeta(item.categories, item.publishedAt, item.publishedAtCustom),
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
