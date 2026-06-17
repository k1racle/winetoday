import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { DesktopSidebarSlot } from "@/components/desktop-sidebar-slot";
import { RichContent } from "@/components/rich-content";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { SidebarPanel } from "@/components/sidebar-panel";
import { DraftPreviewBanner } from "@/components/draft-preview-banner";
import { buildSeoMetadata, getPageBySlug, getSidebarForPath, getSiteSeo, getTagCloud, withLoggedFallback } from "@/lib/strapi";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";
  const [page, siteSeo] = await Promise.all([
    getPageBySlug(slug, { preview: isPreview }),
    withLoggedFallback(`page metadata site seo for ${slug}`, () => getSiteSeo(), null),
  ]);

  if (!page) {
    return {};
  }

  return buildSeoMetadata({
    title: page.title,
    description: page.excerpt ?? page.title,
    seo: page.seo,
    siteSeo,
    path: `/${page.slug}`,
    image: page.seo?.metaImage ?? null,
    robots: isPreview ? { index: false, follow: false } : undefined,
  });
}

export default async function GenericPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";
  const [page, sidebar, tagCloud] = await Promise.all([
    getPageBySlug(slug, { preview: isPreview }),
    withLoggedFallback(`page sidebar for ${slug}`, () => getSidebarForPath(`/${slug}`), null),
    withLoggedFallback(`page tag cloud for ${slug}`, () => getTagCloud(), []),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <>
      {isPreview ? <DraftPreviewBanner type="страницы" /> : null}
      <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <article className="min-w-0 w-full space-y-8 xl:px-[150px]">
          <MobileSidebarBridge sidebar={sidebar} />
          <header className="space-y-4">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }]} />
            <p className="type-caption text-emerald-700 dark:text-emerald-400">
              Страница
            </p>
            <h1 className="type-h1">{page.title}</h1>
          </header>

          <RichContent blocks={page.content} />
          <div className="xl:hidden">
            <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} stacked mobile />
          </div>
        </article>

        <DesktopSidebarSlot>
          <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} />
        </DesktopSidebarSlot>
      </div>
    </main>
    </>
  );
}
