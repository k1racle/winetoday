import Image from "next/image";
import Link from "next/link";
import { generateHTML } from "@tiptap/html";
import parse from "html-react-parser";
import type { ReactNode } from "react";
import { EmbedHtml } from "@/components/embed-html";
import { InfiniteArchivePageList } from "@/components/infinite-archive-page-list";
import { ImageGalleryBlock, ImageSliderBlock } from "@/components/image-collections";
import { parseTiptapDocument, tiptapExtensions } from "@/lib/tiptap";
import type { StrapiBlock } from "@/lib/strapi";
import type { RichTextContent, RichTextNode } from "@/lib/strapi";
import { buildCategoryDateOverlayMeta, getArticles, getNews, getVideos } from "@/lib/strapi";
import type { CategorySummaryList } from "@/lib/strapi";

type RichContentProps = {
  blocks?: StrapiBlock[] | null;
};

type TiptapContentProps = {
  content?: Record<string, unknown> | string | null;
  className?: string;
};

function renderTiptapContent(content?: Record<string, unknown> | string | null): ReactNode {
  const document = parseTiptapDocument(content);

  if (!document) {
    return null;
  }

  try {
    const html = generateHTML(document, tiptapExtensions);
    return parse(html);
  } catch {
    return null;
  }
}

export function TiptapContent({ content, className }: TiptapContentProps) {
  const rendered = renderTiptapContent(content);

  if (!rendered) {
    return null;
  }

  return (
    <div className={className ?? "max-w-none space-y-4 overflow-x-hidden text-base leading-8 text-zinc-700 dark:text-zinc-300 [&_a]:text-emerald-700 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-emerald-900 dark:[&_a]:text-emerald-300 dark:hover:[&_a]:text-emerald-200 [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-500 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-zinc-900 dark:[&_blockquote]:border-emerald-400 dark:[&_blockquote]:text-zinc-100 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_li]:pl-1 [&_h1]:font-heading [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-zinc-950 dark:[&_h1]:text-zinc-50 [&_h2]:font-heading [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-zinc-950 dark:[&_h2]:text-zinc-50 [&_h3]:font-heading [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-zinc-950 dark:[&_h3]:text-zinc-50 [&_h4]:font-heading [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:tracking-tight [&_h4]:text-zinc-950 dark:[&_h4]:text-zinc-50 [&_p]:leading-8 [&_hr]:my-8 [&_hr]:border-black/10 dark:[&_hr]:border-white/10 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:whitespace-nowrap [&_table]:[-webkit-overflow-scrolling:touch] md:[&_table]:table md:[&_table]:overflow-visible md:[&_table]:whitespace-normal [&_table]:w-full [&_th]:border [&_th]:border-black/10 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left dark:[&_th]:border-white/10 [&_td]:border [&_td]:border-black/10 [&_td]:px-3 [&_td]:py-2 dark:[&_td]:border-white/10"}>
      {rendered}
    </div>
  );
}

function renderLegacyRichTextContent(content: string): ReactNode {
  const normalized = content.trim();

  if (!normalized) {
    return null;
  }

  return normalized.split(/\n{2,}/).map((paragraph, index) => (
    <p key={`legacy-rich-text-${index}`}>{paragraph.trim()}</p>
  ));
}

function renderRichTextNodes(nodes?: RichTextContent | null, keyPrefix = "rich"): ReactNode {
  if (!nodes?.length) {
    return null;
  }

  return nodes.map((node, index) => renderRichTextNode(node, `${keyPrefix}-${index}`));
}

function renderRichTextNode(node: RichTextNode, key: string): ReactNode {
  switch (node.type) {
    case "text": {
      let content: ReactNode = node.text ?? "";

      if (node.code) {
        content = <code>{content}</code>;
      }
      if (node.bold) {
        content = <strong>{content}</strong>;
      }
      if (node.italic) {
        content = <em>{content}</em>;
      }
      if (node.underline) {
        content = <u>{content}</u>;
      }
      if (node.strikethrough) {
        content = <s>{content}</s>;
      }

      return <span key={key}>{content}</span>;
    }
    case "link": {
      const href = node.url ?? "#";
      const isExternal = /^https?:\/\//i.test(href);
      return (
        <Link key={key} href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer noopener" : undefined}>
          {renderRichTextNodes(node.children, key)}
        </Link>
      );
    }
    case "paragraph":
      return <p key={key}>{renderRichTextNodes(node.children, key)}</p>;
    case "heading": {
      const level = node.level ?? 2;
      if (level === 1) return <h1 key={key}>{renderRichTextNodes(node.children, key)}</h1>;
      if (level === 2) return <h2 key={key}>{renderRichTextNodes(node.children, key)}</h2>;
      if (level === 3) return <h3 key={key}>{renderRichTextNodes(node.children, key)}</h3>;
      if (level === 4) return <h4 key={key}>{renderRichTextNodes(node.children, key)}</h4>;
      if (level === 5) return <h5 key={key}>{renderRichTextNodes(node.children, key)}</h5>;
      return <h6 key={key}>{renderRichTextNodes(node.children, key)}</h6>;
    }
    case "list": {
      if (node.format === "ordered") {
        return <ol key={key}>{renderRichTextNodes(node.children, key)}</ol>;
      }
      return <ul key={key}>{renderRichTextNodes(node.children, key)}</ul>;
    }
    case "list-item":
      return <li key={key}>{renderRichTextNodes(node.children, key)}</li>;
    case "quote":
      return <blockquote key={key}>{renderRichTextNodes(node.children, key)}</blockquote>;
    case "code":
      return <pre key={key}><code>{renderRichTextNodes(node.children, key)}</code></pre>;
    case "image":
      return node.image?.url ? (
        <figure key={key} className="my-6 overflow-hidden border-t border-black/10 pt-4 dark:border-white/10">
          <Image
            src={node.image.url}
            alt={node.image.alternativeText ?? "Иллюстрация"}
            width={node.image.formats?.medium?.url ? 960 : 1280}
            height={720}
            className="h-auto w-full object-cover"
          />
        </figure>
      ) : null;
    default:
      return null;
  }
}

async function renderArchiveFeed(block: Extract<StrapiBlock, { __component: "blocks.archive-feed" }>) {
  const limit = Math.min(Math.max(block.limit ?? 4, 1), 12);
  const selectedSlugs = new Set(
    (block.categories ?? [])
      .map((category) => category?.slug?.trim())
      .filter((slug): slug is string => Boolean(slug)),
  );
  const filterByCategories = <T extends { categories?: CategorySummaryList | null }>(items: T[]) =>
    selectedSlugs.size
      ? items.filter((item) => (item.categories ?? []).some((category) => category?.slug && selectedSlugs.has(category.slug)))
      : items;
  switch (block.contentType) {
    case "articles": {
      const items = filterByCategories(await getArticles());

      return (
        <section key={`${block.__component}-${block.id}`} className="space-y-5">
          {(block.title || block.description) && (
            <header className="space-y-3">
              {block.title ? <h2 className="type-h3">{block.title}</h2> : null}
              {block.description ? <p className="type-body text-zinc-600 dark:text-zinc-400">{block.description}</p> : null}
            </header>
          )}
          <InfiniteArchivePageList
            emptyLabel="Материалы пока не опубликованы"
            items={items.map((item) => ({
              id: item.documentId,
              href: `/articles/${item.slug}`,
              title: item.title,
              excerpt: item.excerpt,
              imageUrl: item.cover?.url,
              imageAlt: item.cover?.alternativeText ?? item.title,
              meta: buildCategoryDateOverlayMeta(item.categories, item.publishedAt, item.publishedAtCustom),
            }))}
            pageSize={limit}
          />
        </section>
      );
    }
    case "news": {
      const items = filterByCategories(await getNews());

      return (
        <section key={`${block.__component}-${block.id}`} className="space-y-5">
          {(block.title || block.description) && (
            <header className="space-y-3">
              {block.title ? <h2 className="type-h3 font-semibold tracking-tight">{block.title}</h2> : null}
              {block.description ? <p className="type-body leading-8 text-zinc-600 dark:text-zinc-400">{block.description}</p> : null}
            </header>
          )}
          <InfiniteArchivePageList
            emptyLabel="Новости пока не опубликованы"
            items={items.map((item) => ({
              id: item.documentId,
              href: `/news/${item.slug}`,
              title: item.title,
              excerpt: item.excerpt,
              imageUrl: item.cover?.url,
              imageAlt: item.cover?.alternativeText ?? item.title,
              meta: buildCategoryDateOverlayMeta(item.categories, item.publishedAt, item.publishedAtCustom),
            }))}
            pageSize={limit}
          />
        </section>
      );
    }
    case "videos": {
      const items = filterByCategories(await getVideos());

      return (
        <section key={`${block.__component}-${block.id}`} className="space-y-5">
          {(block.title || block.description) && (
            <header className="space-y-3">
              {block.title ? <h2 className="type-h3 font-semibold tracking-tight">{block.title}</h2> : null}
              {block.description ? <p className="type-body leading-8 text-zinc-600 dark:text-zinc-400">{block.description}</p> : null}
            </header>
          )}
          <InfiniteArchivePageList
            emptyLabel="Видеоматериалы пока не опубликованы"
            items={items.map((item) => ({
              id: item.documentId,
              href: `/videos/${item.slug}`,
              title: item.title,
              excerpt: item.excerpt,
              imageUrl: item.cover?.url,
              imageAlt: item.cover?.alternativeText ?? item.title,
              meta: buildCategoryDateOverlayMeta(item.categories, item.publishedAt, item.publishedAtCustom),
            }))}
            pageSize={limit}
          />
        </section>
      );
    }
    default:
      return null;
  }
}

export async function RichContent({ blocks }: RichContentProps) {
  if (!blocks?.length) {
    return null;
  }

  const renderedBlocks = await Promise.all(
    blocks.map(async (block) => {
      if (block.__component === "blocks.archive-feed") {
        return renderArchiveFeed(block);
      }

      return null;
    }),
  );

  return (
    <div className="space-y-8">
      {blocks.map((block, index) => {
        if (renderedBlocks[index]) {
          return renderedBlocks[index];
        }

        if (block.__component === "blocks.hero") {
          const isDark = block.theme === "dark";

          return (
            <section
              key={`${block.__component}-${block.id}`}
              className={
                isDark
                  ? "relative min-h-[360px] overflow-hidden border-l-2 border-emerald-400 pl-6 text-white sm:pl-8"
                  : "relative min-h-[360px] overflow-hidden border-l border-black/10 pl-6 sm:pl-8 dark:border-white/10"
              }
            >
              {block.backgroundVideo?.url ? (
                <>
                  <video
                    src={block.backgroundVideo.url}
                    className="absolute inset-0 h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                </>
              ) : block.backgroundImage?.url ? (
                <>
                  <Image
                    src={block.backgroundImage.url}
                    alt={block.backgroundImage.alternativeText ?? block.title}
                    fill
                    sizes="100vw"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </>
              ) : null}
              <div className="relative z-10 py-10">
              {block.eyebrow ? (
                <p
                  className={
                    isDark
                      ? "type-small font-menu font-medium uppercase tracking-[0.32em] text-emerald-300"
                      : "type-small font-menu font-medium uppercase tracking-[0.32em] text-emerald-700 dark:text-emerald-400"
                  }
                >
                  {block.eyebrow}
                </p>
              ) : null}
              <h2 className="type-h2 mt-3 max-w-4xl font-semibold tracking-tight">{block.title}</h2>
              {block.description ? (
                <p
                  className={
                    isDark
                      ? "type-body mt-4 max-w-3xl leading-8 text-emerald-50/80"
                      : "type-body mt-4 max-w-3xl leading-8 text-zinc-700 dark:text-zinc-300"
                  }
                >
                  {block.description}
                </p>
              ) : null}
              </div>
            </section>
          );
        }

        if (block.__component === "blocks.link-grid") {
          return (
            <section key={`${block.__component}-${block.id}`} className="space-y-5">
              {(block.title || block.description) && (
                <header className="space-y-3">
                  {block.title ? <h2 className="type-h3 font-semibold tracking-tight">{block.title}</h2> : null}
                  {block.description ? (
                    <p className="type-body leading-8 text-zinc-600 dark:text-zinc-400">{block.description}</p>
                  ) : null}
                </header>
              )}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(block.links ?? []).map((item) =>
                  item.href ? (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      className="border-b border-black/10 pb-4 transition-colors hover:text-emerald-900 dark:border-white/10 dark:hover:text-emerald-300"
                    >
                      <span className="type-h4 font-heading block font-semibold tracking-tight">{item.label}</span>
                      {item.description ? (
                        <span className="type-small mt-2 block leading-7 text-zinc-600 dark:text-zinc-400">{item.description}</span>
                      ) : null}
                    </Link>
                  ) : null,
                )}
              </div>
            </section>
          );
        }

        if (block.__component === "blocks.html-editor") {
          return (
            <section key={`${block.__component}-${block.id}`} className="space-y-5">
              {block.title ? <h2 className="type-h3 font-semibold tracking-tight">{block.title}</h2> : null}
              <TiptapContent content={block.content} />
            </section>
          );
        }

        if (block.__component === "blocks.embed") {
          return (
            <section key={`${block.__component}-${block.id}`} className="space-y-5">
              {block.title ? <h2 className="type-h3 font-semibold tracking-tight">{block.title}</h2> : null}
              <EmbedHtml html={block.html} className="max-w-none overflow-x-auto [&_iframe]:max-w-full" />
            </section>
          );
        }

        if (block.__component === "blocks.image-gallery") {
          return <ImageGalleryBlock key={`${block.__component}-${block.id}`} block={block} />;
        }

        if (block.__component === "blocks.image-slider") {
          return <ImageSliderBlock key={`${block.__component}-${block.id}`} block={block} />;
        }

        if (block.__component === "blocks.cta") {
          const isDark = block.theme !== "light";

          return (
            <section
              key={`${block.__component}-${block.id}`}
              className={
                isDark
                  ? "border-l-2 border-emerald-400 pl-6 text-white sm:pl-8"
                  : "border-l-2 border-emerald-700 pl-6 text-zinc-950 sm:pl-8 dark:border-emerald-400 dark:text-emerald-50"
              }
            >
              {block.eyebrow ? (
                <p
                  className={
                    isDark
                      ? "type-small font-menu font-medium uppercase tracking-[0.32em] text-emerald-300"
                      : "type-small font-menu font-medium uppercase tracking-[0.32em] text-emerald-700 dark:text-emerald-300"
                  }
                >
                  {block.eyebrow}
                </p>
              ) : null}
              <h2 className="type-h2 mt-3 max-w-4xl font-semibold tracking-tight">{block.title}</h2>
              {block.description ? (
                <p
                  className={
                    isDark
                      ? "type-body mt-4 max-w-3xl leading-8 text-emerald-50/80"
                      : "type-body mt-4 max-w-3xl leading-8 text-zinc-700 dark:text-emerald-50/80"
                  }
                >
                  {block.description}
                </p>
              ) : null}
              {block.link?.href ? (
                <div className="mt-6">
                  <Link
                    href={block.link.href}
                    className={
                      isDark
                        ? "type-button inline-flex items-center justify-center bg-emerald-400 px-5 py-3 font-semibold text-[#05210d] transition-colors hover:bg-emerald-300"
                        : "type-button inline-flex items-center justify-center bg-[#10351d] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#174b28] dark:bg-emerald-400 dark:text-[#05210d] dark:hover:bg-emerald-300"
                    }
                  >
                    {block.link.label}
                  </Link>
                  {block.link.description ? (
                    <p className="type-small mt-3 leading-7 text-zinc-600 dark:text-zinc-300">{block.link.description}</p>
                  ) : null}
                </div>
              ) : null}
            </section>
          );
        }

        if (block.__component === "blocks.quote") {
          return (
            <blockquote
              key={`${block.__component}-${block.id}`}
              className="type-body border-l-2 border-emerald-700 pl-6 leading-8 text-emerald-950 dark:border-emerald-400 dark:text-emerald-50"
            >
              <p>&laquo;{block.text}&raquo;</p>
              {(block.author || block.role) && (
                <footer className="type-small mt-4 uppercase tracking-[0.2em] text-emerald-800/70 dark:text-emerald-200/70">
                  {[block.author, block.role].filter(Boolean).join(" · ")}
                </footer>
              )}
            </blockquote>
          );
        }

        if (block.__component === "blocks.image-highlight") {
          return (
            <figure
              key={`${block.__component}-${block.id}`}
              className="overflow-hidden border-t border-black/10 pt-4 dark:border-white/10"
            >
              <Image
                src={block.image.url}
                alt={block.image.alternativeText ?? block.caption ?? "Иллюстрация материала"}
                width={1280}
                height={720}
                className="h-auto w-full object-cover"
              />
              {(block.caption || block.credit) ? (
                <figcaption className="space-y-2 p-5">
                  {block.caption ? (
                    <p className="type-small leading-7 text-zinc-700 dark:text-zinc-300">{block.caption}</p>
                  ) : null}
                  {block.credit ? (
                    <p className="type-caption uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                      {block.credit}
                    </p>
                  ) : null}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        if (block.__component === "blocks.rich-text") {
          return (
            <section key={`${block.__component}-${block.id}`} className="space-y-4">
              {block.title ? <h2 className="type-h3 font-semibold tracking-tight">{block.title}</h2> : null}
              <div className="prose prose-zinc max-w-none text-[16px] leading-8 text-zinc-700 prose-headings:font-semibold prose-headings:tracking-tight prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-blockquote:border-l-2 prose-blockquote:border-emerald-700 prose-blockquote:pl-4 prose-blockquote:italic prose-a:text-emerald-700 prose-strong:text-zinc-900 dark:prose-invert dark:text-zinc-300 dark:prose-a:text-emerald-400">
                {typeof block.content === "string"
                  ? renderLegacyRichTextContent(block.content)
                  : renderRichTextNodes(block.content, `${block.__component}-${block.id}`)}
              </div>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}
