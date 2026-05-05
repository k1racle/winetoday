import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { InfiniteArchivePageList } from "@/components/infinite-archive-page-list";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { SidebarPanel } from "@/components/sidebar-panel";
import { buildCategoryDateOverlayMeta, buildSeoMetadata, getSidebarForPath, getSiteSeo, getTagCloud, getTagPageBySlug, withLoggedFallback } from "@/lib/strapi";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [tagPage, siteSeo] = await Promise.all([
    getTagPageBySlug(slug),
    withLoggedFallback(`tag metadata site seo for ${slug}`, () => getSiteSeo(), null),
  ]);

  if (!tagPage) {
    return {};
  }

  return buildSeoMetadata({
    title: `Тег: ${tagPage.name}`,
    description: `Подборка материалов по тегу ${tagPage.name}: новости, статьи и видео.`,
    seo: tagPage.seo,
    siteSeo,
    path: `/tags/${tagPage.slug}`,
  });
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const [tagPage, sidebar, tagCloud] = await Promise.all([
    getTagPageBySlug(slug),
    withLoggedFallback(`tag sidebar for ${slug}`, () => getSidebarForPath(`/tags/${slug}`), null),
    withLoggedFallback(`tag cloud for ${slug}`, () => getTagCloud(), []),
  ]);

  if (!tagPage) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start">
        <section className="min-w-0">
          <MobileSidebarBridge sidebar={sidebar} />
          <header className="border-b border-black/10 pb-8 dark:border-white/10">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Теги" }]} />
            <p className="type-caption text-emerald-700 dark:text-emerald-400">
              Тег
            </p>
            <h1 className="type-h1 mt-3">{tagPage.name}</h1>
          </header>

          <InfiniteArchivePageList
            emptyLabel="По этому тегу пока нет материалов"
            items={tagPage.items.map((item) => ({
              id: `${item.kind}-${item.documentId}`,
              href: item.href,
              title: item.title,
              excerpt: item.excerpt,
              imageUrl: item.cover?.url,
              imageAlt: item.cover?.alternativeText ?? item.title,
              meta: buildCategoryDateOverlayMeta(item.categories, item.publishedAt, item.publishedAtCustom),
            }))}
          />
          <div className="mt-10 lg:hidden">
            <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} stacked mobile />
          </div>
        </section>

        <div className="hidden min-w-0 shrink-0 justify-self-end overflow-hidden lg:sticky lg:block" style={{ top: "var(--site-header-offset-with-gap, 7rem)" }}>
          <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} />
        </div>
      </div>
    </main>
  );
}
