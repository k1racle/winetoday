import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CommunitySection } from "@/components/community-section";
import { ContentTags } from "@/components/content-tags";
import { MaterialEditButton } from "@/components/material-edit-button";
import { RichContent } from "@/components/rich-content";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { RelatedTags } from "@/components/related-tags";
import { SidebarPanel } from "@/components/sidebar-panel";
import { VideoEmbedPreview } from "@/components/video-embed-preview";
import { buildSeoMetadata, formatRussianDateTime, getPrimaryCategory, getSidebarForPath, getSiteSeo, getTagCloud, getVideoBySlug, withLoggedFallback } from "@/lib/strapi";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [video, siteSeo] = await Promise.all([
    getVideoBySlug(slug),
    withLoggedFallback(`video metadata site seo for ${slug}`, () => getSiteSeo(), null),
  ]);

  if (!video) {
    return {};
  }

  return buildSeoMetadata({
    title: video.seo?.metaTitle?.trim() || video.title,
    description: video.seo?.metaDescription?.trim() || video.excerpt?.trim() || video.title,
    seo: video.seo,
    siteSeo,
    path: `/videos/${video.slug}`,
    image: video.cover,
  });
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [video, sidebar, tagCloud] = await Promise.all([
    getVideoBySlug(slug),
    withLoggedFallback(
      `video sidebar for ${slug}`,
      () => getSidebarForPath(`/videos/${slug}`),
      await withLoggedFallback("video fallback sidebar", () => getSidebarForPath("/videos"), null),
    ),
    withLoggedFallback("video tag cloud", () => getTagCloud(), []),
  ]);

  if (!video) {
    notFound();
  }

  const relatedTags = video.tags?.length
    ? video.tags
    : tagCloud
        .filter((tag) => (tag.videos ?? []).some((item) => item.slug === video.slug))
        .map((tag) => ({ slug: tag.slug, name: tag.name }));
  const primaryCategory = getPrimaryCategory(video.categories);
  const headerDate = formatRussianDateTime(video.publishedAtCustom ?? video.publishedAt) ?? "Без даты";

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <article className="min-w-0 w-full space-y-8 xl:px-[150px]">
          <MobileSidebarBridge sidebar={sidebar} />
          <MaterialEditButton type="video" documentId={video.documentId} authorSlug={video.author?.slug} />
          {video.videoUrl ? (
            <VideoEmbedPreview
              title={video.title}
              videoUrl={video.videoUrl}
            />
          ) : null}

          <header className="space-y-4">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Видео", href: "/videos" }]} />
            <h1 className="type-h1">{video.title}</h1>
            <div className="type-caption flex flex-wrap items-center gap-3 text-zinc-500 dark:text-zinc-400">
              <span>{headerDate}</span>
              {primaryCategory ? <span>{primaryCategory.name}</span> : null}
              {video.duration ? <span>{video.duration} мин</span> : null}
              {video.author?.name ? <span>{video.author.name}</span> : null}
            </div>
          </header>

          <RichContent blocks={video.content} />
          <footer>
            <RelatedTags tags={relatedTags} title="Теги материала" />
            <CommunitySection
              contentTypeUid="api::video.video"
              targetDocumentId={video.documentId}
              targetSlug={video.slug}
              title={video.title}
              sharePath={`/videos/${video.slug}`}
            />
          </footer>
          <div className="lg:hidden">
            <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} stacked mobile />
          </div>
        </article>

        <div className="hidden w-[320px] shrink-0 justify-self-end overflow-hidden lg:sticky lg:block" style={{ top: "var(--site-header-offset-with-gap, 7rem)" }}>
          <SidebarPanel sidebar={sidebar} tagCloud={tagCloud} />
        </div>
      </div>
    </main>
  );
}
