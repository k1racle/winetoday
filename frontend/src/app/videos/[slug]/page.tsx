import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CommunitySection } from "@/components/community-section";
import { ContentTags } from "@/components/content-tags";
import { DesktopSidebarSlot } from "@/components/desktop-sidebar-slot";
import { MaterialEditButton } from "@/components/material-edit-button";
import { RichContent } from "@/components/rich-content";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { RelatedTags } from "@/components/related-tags";
import { SidebarPanel } from "@/components/sidebar-panel";
import { VideoEmbedPreview } from "@/components/video-embed-preview";
import { DraftPreviewBanner } from "@/components/draft-preview-banner";
import { buildSeoMetadata, formatRussianDateTime, getPrimaryCategory, getSidebarForPath, getSiteSeo, getTagCloud, getVideoBySlug, getVideos, type VideoSummary, withLoggedFallback } from "@/lib/strapi";
import { buildVideoObjectJsonLd } from "@/lib/json-ld";
import Script from "next/script";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

function getPublishedTimestamp(item: Pick<VideoSummary, "publishedAtCustom" | "publishedAt">) {
  const publishedValue = item.publishedAtCustom ?? item.publishedAt;

  if (!publishedValue) {
    return Number.NEGATIVE_INFINITY;
  }

  const timestamp = new Date(publishedValue).getTime();

  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";
  const [video, siteSeo] = await Promise.all([
    getVideoBySlug(slug, { preview: isPreview }),
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
    robots: isPreview ? { index: false, follow: false } : undefined,
  });
}

export default async function VideoDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";
  const [video, sidebar, tagCloud, videos] = await Promise.all([
    getVideoBySlug(slug, { preview: isPreview }),
    withLoggedFallback(
      `video sidebar for ${slug}`,
      () => getSidebarForPath(`/videos/${slug}`),
      await withLoggedFallback("video fallback sidebar", () => getSidebarForPath("/videos"), null),
    ),
    withLoggedFallback("video tag cloud", () => getTagCloud(), []),
    withLoggedFallback("video related items", () => getVideos(), []),
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
  const jsonLd = buildVideoObjectJsonLd({
    title: video.title,
    description: video.excerpt,
    path: `/videos/${video.slug}`,
    videoUrl: video.videoUrl,
    durationMinutes: video.duration,
    image: video.cover,
    datePublished: video.publishedAtCustom ?? video.publishedAt,
    dateModified: video.publishedAtCustom ?? video.publishedAt,
  });
  const currentCategorySlugs = new Set(
    (video.categories ?? [])
      .map((category) => category?.slug?.trim())
      .filter((categorySlug): categorySlug is string => Boolean(categorySlug)),
  );
  const relatedVideos = videos
    .filter((videoItem) => videoItem.slug !== video.slug)
    .map((videoItem) => {
      const matchingCategories = (videoItem.categories ?? []).reduce((count, category) => {
        const categorySlug = category?.slug?.trim();

        if (!categorySlug || !currentCategorySlugs.has(categorySlug)) {
          return count;
        }

        return count + 1;
      }, 0);

      return {
        ...videoItem,
        matchingCategories,
        publishedTimestamp: getPublishedTimestamp(videoItem),
      };
    })
    .sort(
      (left, right) =>
        right.matchingCategories - left.matchingCategories ||
        right.publishedTimestamp - left.publishedTimestamp,
    )
    .slice(0, 3);

  return (
    <>
      {isPreview ? <DraftPreviewBanner type="видео" /> : null}
      <Script id="video-jsonld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>
      <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
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
            <h1 className="type-h1 archive-page-mobile-title">{video.title}</h1>
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
              afterShareContent={
                relatedVideos.length ? (
                  <section className="space-y-4">
                    <h3 className="text-[18px] font-semibold text-foreground dark:text-white">
                      Смотреть также
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {relatedVideos.map((relatedItem) => (
                        <article
                          key={relatedItem.documentId}
                          className="flex h-full flex-col overflow-hidden border border-black/10 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.04]"
                        >
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                            <Link href={`/videos/${relatedItem.slug}`} aria-label={relatedItem.title} className="block h-full">
                              {relatedItem.cover?.url ? (
                                <Image
                                  src={relatedItem.cover.url}
                                  alt={relatedItem.cover.alternativeText ?? relatedItem.title}
                                  fill
                                  sizes="(min-width: 1280px) 240px, (min-width: 768px) 50vw, 100vw"
                                  className="object-cover"
                                />
                              ) : null}
                            </Link>
                          </div>
                          <div className="p-4">
                            <p className="type-body-sm text-[#0d3132] dark:text-white">
                              <Link href={`/videos/${relatedItem.slug}`} className="transition hover:text-emerald-700 dark:hover:text-emerald-200">
                                {relatedItem.title}
                              </Link>
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null
              }
            />
          </footer>
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
