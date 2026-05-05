import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { RichContent } from "@/components/rich-content";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { SidebarPanel } from "@/components/sidebar-panel";
import { buildSeoMetadata, getPageBySlug, getSidebarForPath, getSiteSeo, getTagCloud, withLoggedFallback } from "@/lib/strapi";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [page, siteSeo] = await Promise.all([
    getPageBySlug(slug),
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
  });
}

export default async function GenericPage({ params }: PageProps) {
  const { slug } = await params;
  const [page, sidebar, tagCloud] = await Promise.all([
    getPageBySlug(slug),
    withLoggedFallback(`page sidebar for ${slug}`, () => getSidebarForPath(`/${slug}`), null),
    withLoggedFallback(`page tag cloud for ${slug}`, () => getTagCloud(), []),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start">
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
          <div className="lg:hidden">
            <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} stacked mobile />
          </div>
        </article>

        <div className="hidden min-w-0 shrink-0 justify-self-end overflow-hidden lg:sticky lg:block" style={{ top: "var(--site-header-offset-with-gap, 7rem)" }}>
          <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} />
        </div>
      </div>
    </main>
  );
}
