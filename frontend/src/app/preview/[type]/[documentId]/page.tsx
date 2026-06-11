import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { RichContent } from "@/components/rich-content";
import { SourceLinks } from "@/components/source-links";
import { VideoEmbedPreview } from "@/components/video-embed-preview";
import { isEditorContentType } from "@/lib/editor-shared";
import { SITE_URL, type StrapiBlock, type SourceLink } from "@/lib/strapi";

const PREVIEW_SECRET = process.env.PREVIEW_SECRET;

type PreviewPageProps = {
  params: Promise<{ type: string; documentId: string }>;
  searchParams: Promise<{ secret?: string }>;
};

export const metadata: Metadata = {
  title: "Предпросмотр черновика",
  robots: { index: false, follow: false },
};

/* preview feature deployed */

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const { type, documentId } = await params;
  const { secret } = await searchParams;

  if (!PREVIEW_SECRET || secret !== PREVIEW_SECRET) {
    notFound();
  }

  if (!isEditorContentType(type) || !documentId) {
    notFound();
  }

  const apiUrl = new URL("/api/preview", SITE_URL);
  apiUrl.searchParams.set("type", type);
  apiUrl.searchParams.set("documentId", documentId);
  apiUrl.searchParams.set("secret", PREVIEW_SECRET);

  const response = await fetch(apiUrl.toString(), { cache: "no-store" });

  if (!response.ok) {
    notFound();
  }

  const body = (await response.json()) as { ok: boolean; item?: Record<string, unknown> | null };

  if (!body.ok || !body.item) {
    notFound();
  }

  const item = body.item;
  const title = typeof item.title === "string" ? item.title : "Без заголовка";
  const excerpt = typeof item.excerpt === "string" ? item.excerpt : null;
  const cover = isRecord(item.cover) ? (item.cover as Record<string, unknown>) : null;
  const coverUrl = typeof cover?.url === "string" ? cover.url : null;
  const coverAlt = typeof cover?.alternativeText === "string" ? cover.alternativeText : title;
  const coverSource = typeof item.coverSource === "string" ? item.coverSource : null;
  const videoUrl = typeof item.videoUrl === "string" ? item.videoUrl : null;
  const authorName = isRecord(item.author) && typeof item.author.name === "string" ? item.author.name : null;
  const categories = Array.isArray(item.categories) ? item.categories.filter(isRecord) : [];
  const primaryCategory = categories[0] as Record<string, unknown> | undefined;
  const primaryCategoryName = isRecord(primaryCategory) && typeof primaryCategory.name === "string" ? primaryCategory.name : null;
  const publishedAtCustom = typeof item.publishedAtCustom === "string" ? item.publishedAtCustom : null;
  const publishedAt = typeof item.publishedAt === "string" ? item.publishedAt : null;
  const content = Array.isArray(item.content) ? item.content : null;
  const sources = Array.isArray(item.sources) ? item.sources.filter(isRecord) : null;

  const headerDate = publishedAtCustom ?? publishedAt ?? "Без даты";

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded border border-amber-600/40 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/40 dark:bg-amber-900/20 dark:text-amber-200">
          <span className="font-semibold">Предпросмотр черновика</span>
          <span className="ml-2 opacity-80">Материал ещё не опубликован и виден только по этой ссылке.</span>
        </div>

        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Предпросмотр", href: "#" },
          ]}
        />

        <article className="space-y-6">
          <header className="space-y-4">
            <div className="type-caption flex flex-wrap items-center gap-3 text-zinc-500 dark:text-zinc-400">
              <span>{headerDate}</span>
              {primaryCategoryName ? <span>{primaryCategoryName}</span> : null}
              {authorName ? <span>{authorName}</span> : null}
            </div>
            <h1 className="type-h1 archive-page-mobile-title">{title}</h1>
            {excerpt ? <p className="type-body text-zinc-600 dark:text-zinc-400">{excerpt}</p> : null}

            {videoUrl ? <VideoEmbedPreview title={title} videoUrl={videoUrl} /> : null}

            {coverUrl ? (
              <>
                <Image
                  src={coverUrl}
                  alt={coverAlt}
                  width={1280}
                  height={720}
                  sizes="100vw"
                  className="h-auto w-full object-cover"
                />
                {coverSource ? (
                  <p className="type-caption text-zinc-500 dark:text-zinc-400">Источник: {coverSource}</p>
                ) : null}
              </>
            ) : null}
          </header>

          {content ? <RichContent blocks={content as StrapiBlock[]} paragraphLineHeightClassName="leading-6" /> : null}
          {sources?.length ? <SourceLinks sources={sources as SourceLink[]} className="pt-2" /> : null}
        </article>
      </div>
    </main>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
