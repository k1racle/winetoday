"use client";

import { type ChangeEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EditorContent, useEditor } from "@tiptap/react";
import { generateHTML, generateJSON } from "@tiptap/html";
import { getAuthModeLabel, resolveAuthMode } from "@/lib/auth-shared";
import type { EditorAuthorOption, EditorBlock, EditorContentType, EditorEntrySummary, EditorInfographicCard, EditorInfographicVersion, EditorSeo, EditorSession, EditorTaxonomyOption } from "@/lib/editor-shared";
import { EDITOR_BLOCK_TYPES, isEditorContentType } from "@/lib/editor-shared";
import { createEmptyTiptapDocument, parseTiptapDocument, serializeTiptapDocument, tiptapExtensions } from "@/lib/tiptap";

type EditorApiError = {
  error?: {
    message?: string;
  };
  message?: string;
};

type EditorEntryPayload = EditorApiError & Record<string, unknown> & {
  documentId?: string;
};

type UploadedAsset = {
  id: number;
  name?: string;
  url?: string;
  mime?: string;
  alternativeText?: string | null;
  previewUrl?: string | null;
};

type SourceItem = {
  name: string;
  url: string;
};

type FormState = {
  documentId: string | null;
  type: EditorContentType;
  title: string;
  slug: string;
  excerpt: string;
  cover: number | null;
  coverSource: string;
  author: number | null;
  categories: number[];
  tags: number[];
  homepageSpecialBlock: boolean;
  status: "draft" | "published";
  publishedAtCustom: string;
  readingTime: string;
  sources: SourceItem[];
  startsAt: string;
  endsAt: string;
  locationName: string;
  city: string;
  address: string;
  ticketUrl: string;
  videoUrl: string;
  duration: string;
  infographicTitle: string;
  infographicDescription: string;
  infographicCardsDesktop: EditorInfographicCard[];
  infographicCardsTablet: EditorInfographicCard[];
  infographicCardsMobile: EditorInfographicCard[];
  seo: EditorSeo;
  blocks: EditorBlock[];
};

const INFOGRAPHIC_VIEWPORTS: EditorInfographicVersion[] = ["desktop", "tablet", "mobile"];

const INFOGRAPHIC_VIEWPORT_LABELS: Record<EditorInfographicVersion, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

const INFOGRAPHIC_VIEWPORT_CARD_COUNTS: Record<EditorInfographicVersion, number> = {
  desktop: 8,
  tablet: 6,
  mobile: 7,
};

const EMPTY_SEO: EditorSeo = {
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  canonicalUrl: "",
  noIndex: false,
  noFollow: false,
};

const EMPTY_RICH_BLOCK: Extract<EditorBlock, { __component: "blocks.html-editor" }> = {
  __component: "blocks.html-editor",
  title: "",
  content: createEmptyTiptapDocument(),
};

const EMPTY_EMBED_BLOCK: Extract<EditorBlock, { __component: "blocks.embed" }> = {
  __component: "blocks.embed",
  title: "",
  html: "",
};

function createEmptyInfographicCard(): EditorInfographicCard {
  return {
    shape: "square",
    title: "",
    description: "",
    href: "",
    backgroundImage: null,
    backgroundVideo: null,
    cornerIcon: null,
    accentText: "",
    theme: "light",
  };
}

function normalizeEditorInfographicCards(cards: any, expectedCount: number): EditorInfographicCard[] {
  const normalized: EditorInfographicCard[] = Array.isArray(cards)
    ? cards.slice(0, expectedCount).map((card: any) => ({
        id: typeof card?.id === "number" ? card.id : undefined,
        shape: card?.shape === "rectangle" || card?.shape === "circle" ? card.shape : "square",
        title: card?.title ?? "",
        description: card?.description ?? "",
        href: card?.href ?? "",
        backgroundImage: card?.backgroundImage?.id ?? card?.backgroundImage ?? null,
        backgroundVideo: card?.backgroundVideo?.id ?? card?.backgroundVideo ?? null,
        cornerIcon: card?.cornerIcon?.id ?? card?.cornerIcon ?? null,
        accentText: card?.accentText ?? "",
        theme: card?.theme === "dark" ? "dark" : "light",
      }))
    : [];

  while (normalized.length < expectedCount) {
    normalized.push(createEmptyInfographicCard());
  }

  return normalized;
}

function createInitialState(type: EditorContentType): FormState {
  return {
    documentId: null,
    type,
    title: "",
    slug: "",
    excerpt: "",
    cover: null,
    coverSource: "",
    author: null,
    categories: [],
    tags: [],
    homepageSpecialBlock: false,
    status: "draft",
    publishedAtCustom: toDateTimeLocalValue(new Date().toISOString()),
    readingTime: "5",
    sources: [{ name: "", url: "" }],
    startsAt: "",
    endsAt: "",
    locationName: "",
    city: "",
    address: "",
    ticketUrl: "",
    videoUrl: "",
    duration: "1",
    infographicTitle: "",
    infographicDescription: "",
    infographicCardsDesktop: normalizeEditorInfographicCards([], INFOGRAPHIC_VIEWPORT_CARD_COUNTS.desktop),
    infographicCardsTablet: normalizeEditorInfographicCards([], INFOGRAPHIC_VIEWPORT_CARD_COUNTS.tablet),
    infographicCardsMobile: normalizeEditorInfographicCards([], INFOGRAPHIC_VIEWPORT_CARD_COUNTS.mobile),
    seo: { ...EMPTY_SEO },
    blocks: [{ ...EMPTY_RICH_BLOCK }],
  };
}

function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function getErrorMessage(payload: EditorApiError | null, fallback: string) {
  return payload?.error?.message || payload?.message || fallback;
}

async function parseJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

function blockLabel(type: EditorBlock["__component"]) {
  switch (type) {
    case "blocks.html-editor":
      return "Текстовый блок";
    case "blocks.embed":
      return "Embed HTML";
    case "blocks.image-gallery":
      return "Галерея изображений";
    case "blocks.image-slider":
      return "Слайдер изображений";
    case "blocks.image-highlight":
      return "Акцентное изображение";
    default:
      return "Блок";
  }
}

function isMediaCollectionBlock(
  block: EditorBlock,
): block is Extract<EditorBlock, { __component: "blocks.image-gallery" | "blocks.image-slider" }> {
  return block.__component === "blocks.image-gallery" || block.__component === "blocks.image-slider";
}

function legacyTextToTiptapDocument(value: string) {
  const parts = value
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return createEmptyTiptapDocument();
  }

  return {
    type: "doc",
    content: parts.map((part) => ({
      type: "paragraph",
      content: [{ type: "text", text: part }],
    })),
  } satisfies Record<string, unknown>;
}

function flattenLegacyNodes(nodes: any[]): string {
  return nodes
    .flatMap((node) => {
      if (node?.type === "paragraph" && Array.isArray(node.children)) {
        return [node.children.map((child: any) => (typeof child?.text === "string" ? child.text : "")).join("")];
      }

      if (Array.isArray(node?.children)) {
        return [node.children.map((child: any) => (typeof child?.text === "string" ? child.text : "")).join("")];
      }

      return [];
    })
    .filter(Boolean)
    .join("\n\n");
}

function normalizeFormState(type: EditorContentType, entry: any): FormState {
  const state = createInitialState(type);
  const normalizedSources = Array.isArray(entry.sources)
    ? entry.sources
      .map((item: any) => ({
        name: item?.name ?? "",
        url: item?.url ?? "",
      }))
      .filter((item: SourceItem) => item.name || item.url)
    : [];

  return {
    ...state,
    documentId: entry.documentId ?? null,
    title: entry.title ?? "",
    slug: entry.slug ?? "",
    excerpt: entry.excerpt ?? "",
    cover: entry.cover?.id ?? null,
    coverSource: entry.coverSource ?? "",
    author: entry.author?.id ?? null,
    categories: Array.isArray(entry.categories) ? entry.categories.map((item: any) => item?.id).filter(Boolean) : [],
    tags: Array.isArray(entry.tags) ? entry.tags.map((item: any) => item?.id).filter(Boolean) : [],
    homepageSpecialBlock: entry.homepageSpecialBlock === true,
    status: entry.editorStatus === "published" || entry.publishedAt ? "published" : "draft",
    publishedAtCustom: toDateTimeLocalValue(typeof entry.publishedAtCustom === "string" ? entry.publishedAtCustom : null),
    readingTime: entry.readingTime ? String(entry.readingTime) : state.readingTime,
    sources: normalizedSources.length
      ? normalizedSources
      : entry.sourceName || entry.sourceUrl
        ? [{ name: entry.sourceName ?? "", url: entry.sourceUrl ?? "" }]
        : state.sources,
    startsAt: typeof entry.startsAt === "string" ? entry.startsAt.slice(0, 16) : "",
    endsAt: typeof entry.endsAt === "string" ? entry.endsAt.slice(0, 16) : "",
    locationName: entry.locationName ?? "",
    city: entry.city ?? "",
    address: entry.address ?? "",
    ticketUrl: entry.ticketUrl ?? "",
    videoUrl: entry.videoUrl ?? "",
    duration: entry.duration ? String(entry.duration) : state.duration,
    infographicTitle: entry.infographicTitle ?? "",
    infographicDescription: entry.infographicDescription ?? "",
    infographicCardsDesktop: normalizeEditorInfographicCards(entry.infographicCardsDesktop ?? entry.infographicCards, INFOGRAPHIC_VIEWPORT_CARD_COUNTS.desktop),
    infographicCardsTablet: normalizeEditorInfographicCards(entry.infographicCardsTablet ?? entry.infographicCards, INFOGRAPHIC_VIEWPORT_CARD_COUNTS.tablet),
    infographicCardsMobile: normalizeEditorInfographicCards(entry.infographicCardsMobile ?? entry.infographicCards, INFOGRAPHIC_VIEWPORT_CARD_COUNTS.mobile),
    seo: {
      metaTitle: entry.seo?.metaTitle ?? "",
      metaDescription: entry.seo?.metaDescription ?? "",
      keywords: entry.seo?.keywords ?? "",
      canonicalUrl: entry.seo?.canonicalUrl ?? "",
      noIndex: entry.seo?.noIndex === true,
      noFollow: entry.seo?.noFollow === true,
    },
    blocks: Array.isArray(type === "homepage" ? entry.blocks : entry.content)
      ? (type === "homepage" ? entry.blocks : entry.content).map((block: any) => {
          if (block.__component === "blocks.html-editor") {
            return {
              __component: "blocks.html-editor" as const,
              title: block.title ?? "",
              content: parseTiptapDocument(block.content) ?? createEmptyTiptapDocument(),
            };
          }

          if (block.__component === "blocks.embed") {
            return {
              __component: "blocks.embed" as const,
              title: block.title ?? "",
              html: typeof block.html === "string" ? block.html : "",
            };
          }

          if (block.__component === "blocks.rich-text") {
            const content = typeof block.content === "string"
              ? legacyTextToTiptapDocument(block.content)
              : Array.isArray(block.content)
                ? legacyTextToTiptapDocument(flattenLegacyNodes(block.content))
                : createEmptyTiptapDocument();

            return {
              __component: "blocks.html-editor" as const,
              title: block.title ?? "",
              content,
            };
          }

          if (block.__component === "blocks.image-highlight") {
            return {
              __component: "blocks.image-highlight" as const,
              caption: block.caption ?? "",
              credit: block.credit ?? "",
              image: block.image?.id ?? null,
            };
          }

          return {
            __component: block.__component,
            title: block.title ?? "",
            description: block.description ?? "",
            images: Array.isArray(block.images) ? block.images.map((image: any) => image?.id).filter(Boolean) : [],
          };
        })
      : state.blocks,
  };
}

async function uploadFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }

  const payload = {
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    contentBase64: btoa(binary),
  };

  const response = await fetch("/api/editor/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responsePayload = await parseJson<UploadedAsset[] | EditorApiError>(response);

  if (!response.ok || !Array.isArray(responsePayload) || !responsePayload[0]?.id) {
    throw new Error(getErrorMessage(responsePayload as EditorApiError | null, "Не удалось загрузить файл."));
  }

  return responsePayload[0].id;
}

async function refreshMediaAssets() {
  const mediaResponse = await fetch("/api/editor/media", { cache: "no-store" });
  const mediaPayload = await parseJson<UploadedAsset[] | EditorApiError>(mediaResponse);

  if (!mediaResponse.ok || !Array.isArray(mediaPayload)) {
    return null;
  }

  return mediaPayload;
}

type MediaPickerProps = {
  assets: UploadedAsset[];
  accept: "image" | "video";
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  uploadLabel: string;
};

function filterAssetsByAccept(assets: UploadedAsset[], accept: "image" | "video") {
  return assets.filter((asset) => accept === "image"
    ? asset.mime?.startsWith("image/")
    : asset.mime?.startsWith("video/"));
}

function findAssetById(assets: UploadedAsset[], selectedId: number | null, accept?: "image" | "video") {
  if (selectedId === null) {
    return null;
  }

  const source = accept ? filterAssetsByAccept(assets, accept) : assets;
  return source.find((asset) => asset.id === selectedId) ?? null;
}

function MediaPicker({ assets, accept, selectedId, onSelect, onUpload, uploadLabel }: MediaPickerProps) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const typedAssets = filterAssetsByAccept(assets, accept);

    if (!normalizedQuery) {
      return typedAssets;
    }

    return typedAssets.filter((asset) => {
      const haystack = [asset.name, asset.alternativeText, asset.url, String(asset.id)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [accept, assets, query]);
  const selectedAsset = filteredAssets.find((asset) => asset.id === selectedId) ?? assets.find((asset) => asset.id === selectedId) ?? null;
  const visibleAssets = expanded ? filteredAssets : filteredAssets.slice(0, 12);
  const previewUrl = selectedAsset?.previewUrl || selectedAsset?.url || null;

  return (
    <div className="grid gap-3">
      <input type="file" accept={accept === "image" ? "image/*" : "video/*"} onChange={onUpload} className={fileInputClassName} />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{uploadLabel}</p>
      <div className="grid gap-3 border border-black/10 p-3 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setExpanded(false);
            }}
            placeholder={accept === "image" ? "Поиск по изображениям" : "Поиск по видео"}
            className={`${inputClassName} min-w-[220px] flex-1 py-2.5 text-sm`}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="inline-flex items-center border border-black/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"
            >
              Очистить
            </button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <button
              type="button"
              onClick={() => onSelect(null)}
              className={`min-h-[88px] border px-3 py-3 text-left text-sm transition-colors ${selectedId === null ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-200" : "border-black/10 hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"}`}
            >
              Без файла
            </button>
            {visibleAssets.map((asset) => {
              const isSelected = asset.id === selectedId;
              const cardPreviewUrl = asset.previewUrl || asset.url;

              return (
                <button
                  key={`${accept}-${asset.id}`}
                  type="button"
                  onClick={() => onSelect(asset.id)}
                  className={`overflow-hidden border text-left transition-colors ${isSelected ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10" : "border-black/10 hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"}`}
                >
                  <div className="relative aspect-[16/10] bg-black/[0.04] dark:bg-white/[0.04]">
                    {accept === "image" && cardPreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cardPreviewUrl} alt={asset.alternativeText || asset.name || ""} className="h-full w-full object-cover" />
                    ) : null}
                    {accept === "video" ? (
                      <div className="flex h-full items-center justify-center px-3 text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Видео</div>
                    ) : null}
                  </div>
                  <div className="p-3 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{asset.name || `Файл #${asset.id}`}</div>
                    <div>ID: {asset.id}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
            <div className="border-b border-black/10 px-4 py-3 dark:border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Текущий выбор</p>
            </div>
            {selectedAsset ? (
              <div className="space-y-3 p-4">
                <div className="relative aspect-[16/10] overflow-hidden bg-black/[0.05] dark:bg-white/[0.04]">
                  {accept === "image" && previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt={selectedAsset.alternativeText || selectedAsset.name || ""} className="h-full w-full object-cover" />
                  ) : null}
                  {accept === "video" ? (
                    previewUrl ? (
                      <video src={previewUrl} className="h-full w-full object-cover" controls preload="metadata" />
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Видео выбрано</div>
                    )
                  ) : null}
                </div>
                <div className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{selectedAsset.name || `Файл #${selectedAsset.id}`}</div>
                  <div>ID: {selectedAsset.id}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-sm leading-6 text-zinc-500 dark:text-zinc-400">Файл пока не выбран.</div>
            )}
          </div>
        </div>

        {filteredAssets.length > 12 ? (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="inline-flex items-center border border-black/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"
            >
              {expanded ? "Скрыть часть" : `Показать еще (${filteredAssets.length - visibleAssets.length})`}
            </button>
          </div>
        ) : null}

        {!visibleAssets.length ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">По этому запросу ничего не найдено.</div>
        ) : null}
      </div>
    </div>
  );
}

function MediaSummaryCard({
  asset,
  accept,
  emptyLabel,
  onOpen,
  onClear,
  openLabel,
}: {
  asset: UploadedAsset | null;
  accept: "image" | "video";
  emptyLabel: string;
  onOpen: () => void;
  onClear?: (() => void) | null;
  openLabel: string;
}) {
  const previewUrl = asset?.previewUrl || asset?.url || null;

  return (
    <div className="grid gap-3 border border-black/10 p-4 dark:border-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]">
            {asset ? (
              accept === "image" && previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={asset.alternativeText || asset.name || ""} className="h-full w-full object-cover" />
              ) : accept === "video" && previewUrl ? (
                <video src={previewUrl} className="h-full w-full object-cover" muted preload="metadata" />
              ) : (
                <span className="px-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{accept === "image" ? "Фото" : "Видео"}</span>
              )
            ) : (
              <span className="px-2 text-center text-[11px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Нет файла</span>
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {asset?.name || emptyLabel}
            </p>
            <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {asset ? `ID: ${asset.id}` : "Файл пока не выбран."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center border border-black/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"
          >
            {openLabel}
          </button>
          {asset && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center border border-black/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"
            >
              Очистить
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={[
        "inline-flex h-9 w-9 items-center justify-center border border-black/10 bg-white text-zinc-700 transition-colors dark:border-white/10 dark:bg-[#08110b] dark:text-zinc-200",
        active
          ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-[#08110b]"
          : "hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-7 w-px bg-black/10 dark:bg-white/10" aria-hidden="true" />;
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      {children}
    </svg>
  );
}

function BoldIcon() {
  return <Icon><path d="M7 5h6a4 4 0 0 1 0 8H7z" /><path d="M7 13h7a4 4 0 0 1 0 8H7z" /></Icon>;
}

function ItalicIcon() {
  return <Icon><line x1="14" y1="4" x2="10" y2="20" /><line x1="8" y1="4" x2="16" y2="4" /><line x1="6" y1="20" x2="14" y2="20" /></Icon>;
}

function UnderlineIcon() {
  return <Icon><path d="M7 4v6a5 5 0 0 0 10 0V4" /><line x1="5" y1="20" x2="19" y2="20" /></Icon>;
}

function StrikeIcon() {
  return <Icon><path d="M17 6H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H7" /><line x1="4" y1="12" x2="20" y2="12" /></Icon>;
}

function BulletListIcon() {
  return <Icon><line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><circle cx="5" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="5" cy="18" r="1" fill="currentColor" stroke="none" /></Icon>;
}

function OrderedListIcon() {
  return <Icon><line x1="10" y1="6" x2="20" y2="6" /><line x1="10" y1="12" x2="20" y2="12" /><line x1="10" y1="18" x2="20" y2="18" /><path d="M4 7h2V4" /><path d="M6 4 4 6" /><path d="M4 10h2v4" /><path d="M4 18c0-1 2-1 2-3 0-1-1-2-2-2" /></Icon>;
}

function QuoteIcon() {
  return <Icon><path d="M8 9H5v4h3v5l4-5V9H8Z" /><path d="M17 9h-3v4h3v5l4-5V9h-4Z" /></Icon>;
}

function AlignLeftIcon() {
  return <Icon><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="17" x2="18" y2="17" /></Icon>;
}

function AlignCenterIcon() {
  return <Icon><line x1="4" y1="7" x2="20" y2="7" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="5" y1="17" x2="19" y2="17" /></Icon>;
}

function AlignRightIcon() {
  return <Icon><line x1="4" y1="7" x2="20" y2="7" /><line x1="10" y1="12" x2="20" y2="12" /><line x1="6" y1="17" x2="20" y2="17" /></Icon>;
}

function AlignJustifyIcon() {
  return <Icon><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></Icon>;
}

function LinkIcon() {
  return <Icon><path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 1 1 7 7l-1 1" /><path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 1 1-7-7l1-1" /></Icon>;
}

function CodeIcon() {
  return <Icon><polyline points="9 18 3 12 9 6" /><polyline points="15 6 21 12 15 18" /></Icon>;
}

function CodeBlockIcon() {
  return <Icon><path d="M4 6h16v12H4z" /><polyline points="10 10 8 12 10 14" /><polyline points="14 10 16 12 14 14" /></Icon>;
}

function ImageIcon() {
  return <Icon><rect x="4" y="5" width="16" height="14" /><circle cx="9" cy="10" r="1.5" /><path d="M20 16l-4.5-4.5L9 18" /></Icon>;
}

function TableIcon() {
  return <Icon><rect x="4" y="5" width="16" height="14" /><line x1="4" y1="10" x2="20" y2="10" /><line x1="4" y1="14" x2="20" y2="14" /><line x1="10" y1="5" x2="10" y2="19" /><line x1="15" y1="5" x2="15" y2="19" /></Icon>;
}

function ParagraphIcon() {
  return <Icon><path d="M6 6h10a4 4 0 0 1 0 8h-4" /><line x1="12" y1="6" x2="12" y2="20" /><line x1="16" y1="6" x2="16" y2="20" /></Icon>;
}

function HrIcon() {
  return <Icon><line x1="5" y1="12" x2="19" y2="12" /><polyline points="9 8 5 12 9 16" /><polyline points="15 8 19 12 15 16" /></Icon>;
}

function TableDeleteIcon() {
  return <Icon><rect x="5" y="6" width="10" height="12" /><line x1="5" y1="10" x2="15" y2="10" /><line x1="10" y1="6" x2="10" y2="18" /><line x1="18" y1="8" x2="21" y2="11" /><line x1="21" y1="8" x2="18" y2="11" /></Icon>;
}

function UndoIcon() {
  return <Icon><path d="M9 7H5V3" /><path d="M5 7c2-2.5 5-4 8.5-4A7.5 7.5 0 1 1 6 16" /></Icon>;
}

function RedoIcon() {
  return <Icon><path d="M15 7h4V3" /><path d="M19 7c-2-2.5-5-4-8.5-4A7.5 7.5 0 1 0 18 16" /></Icon>;
}

function PlusIcon() {
  return <Icon><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>;
}

function ChevronUpIcon() {
  return <Icon><polyline points="18 15 12 9 6 15" /></Icon>;
}

function ChevronDownIcon() {
  return <Icon><polyline points="6 9 12 15 18 9" /></Icon>;
}

function TrashIcon() {
  return <Icon><path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M6 7l1 12h10l1-12" /><path d="M9 7V4h6v3" /></Icon>;
}

function CloseIcon() {
  return <Icon><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></Icon>;
}

function RichTextBlockEditor({
  value,
  onChange,
}: {
  value: Record<string, unknown> | string;
  onChange: (value: Record<string, unknown>) => void;
}) {
  const [mode, setMode] = useState<"visual" | "code">("visual");
  const [codeValue, setCodeValue] = useState("");
  const editor = useEditor({
    extensions: tiptapExtensions,
    immediatelyRender: false,
    content: parseTiptapDocument(value) ?? createEmptyTiptapDocument(),
    editorProps: {
      attributes: {
        class:
          "min-h-[260px] max-w-none px-4 py-4 text-[15px] leading-8 text-zinc-800 outline-none dark:text-zinc-200 [&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-zinc-400 [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_ol]:ml-6 [&_ol]:list-decimal [&_p]:my-3 [&_ul]:ml-6 [&_ul]:list-disc",
        "data-placeholder": "Введите текст блока",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextContent = parseTiptapDocument(value) ?? createEmptyTiptapDocument();
    const currentContent = editor.getJSON();

    if (JSON.stringify(currentContent) !== JSON.stringify(nextContent)) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }

    try {
      setCodeValue(generateHTML(nextContent, tiptapExtensions));
    } catch {
      setCodeValue("");
    }
  }, [editor, value]);

  function applyCodeModeValue(nextValue: string) {
    setCodeValue(nextValue);

    try {
      const json = generateJSON(nextValue, tiptapExtensions);
      onChange(json);
      editor?.commands.setContent(json, { emitUpdate: false });
    } catch {
      const fallbackDocument = {
        type: "doc",
        content: [{ type: "paragraph", content: nextValue.trim() ? [{ type: "text", text: nextValue }] : [] }],
      } satisfies Record<string, unknown>;

      onChange(fallbackDocument);
      editor?.commands.setContent(fallbackDocument, { emitUpdate: false });
    }
  }

  if (!editor) {
    return <div className="border border-black/10 px-4 py-6 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">Инициализация редактора…</div>;
  }

  return (
    <div className="overflow-hidden border border-black/10 bg-white dark:border-white/10 dark:bg-[#08110b]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-3 py-3 dark:border-white/10">
        <div className="inline-flex border border-black/10 dark:border-white/10">
          <button type="button" onClick={() => setMode("visual")} className={`px-3 py-2 text-sm transition-colors ${mode === "visual" ? "bg-black text-white dark:bg-white dark:text-[#08110b]" : "text-zinc-600 dark:text-zinc-300"}`}>
            Визуально
          </button>
          <button type="button" onClick={() => setMode("code")} className={`px-3 py-2 text-sm transition-colors ${mode === "code" ? "bg-black text-white dark:bg-white dark:text-[#08110b]" : "text-zinc-600 dark:text-zinc-300"}`}>
            Код
          </button>
        </div>
        {mode === "visual" ? (
          <div className="flex flex-wrap gap-2">
            <select
              value={editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : "paragraph"}
              onChange={(event) => {
                const nextValue = event.target.value;

                if (nextValue === "h2") {
                  editor.chain().focus().setHeading({ level: 2 }).run();
                  return;
                }

                if (nextValue === "h3") {
                  editor.chain().focus().setHeading({ level: 3 }).run();
                  return;
                }

                editor.chain().focus().setParagraph().run();
              }}
              className="h-9 border border-black/10 bg-white px-3 text-sm text-zinc-700 outline-none transition-colors focus:border-black dark:border-white/10 dark:bg-[#08110b] dark:text-zinc-200 dark:focus:border-white"
            >
              <option value="paragraph">Абзац</option>
              <option value="h2">Заголовок H2</option>
              <option value="h3">Заголовок H3</option>
            </select>
            <ToolbarButton title="Абзац" onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")}><ParagraphIcon /></ToolbarButton>
            <ToolbarButton title="Жирный" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><BoldIcon /></ToolbarButton>
            <ToolbarButton title="Курсив" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><ItalicIcon /></ToolbarButton>
            <ToolbarButton title="Подчёркнутый" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}><UnderlineIcon /></ToolbarButton>
            <ToolbarButton title="Зачёркнутый" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}><StrikeIcon /></ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton title="Маркированный список" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><BulletListIcon /></ToolbarButton>
            <ToolbarButton title="Нумерованный список" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><OrderedListIcon /></ToolbarButton>
            <ToolbarButton title="Цитата" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><QuoteIcon /></ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton title="Выравнивание по левому краю" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}><AlignLeftIcon /></ToolbarButton>
            <ToolbarButton title="Выравнивание по центру" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}><AlignCenterIcon /></ToolbarButton>
            <ToolbarButton title="Выравнивание по правому краю" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}><AlignRightIcon /></ToolbarButton>
            <ToolbarButton title="Выравнивание по ширине" onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })}><AlignJustifyIcon /></ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton title="Встроенный код" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}><CodeIcon /></ToolbarButton>
            <ToolbarButton title="Блок кода" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}><CodeBlockIcon /></ToolbarButton>
            <ToolbarButton
              title="Ссылка"
              onClick={() => {
                const previousUrl = editor.getAttributes("link").href as string | undefined;
                const url = window.prompt("Ссылка", previousUrl ?? "https://");

                if (url === null) {
                  return;
                }

                if (!url.trim()) {
                  editor.chain().focus().unsetLink().run();
                  return;
                }

                editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
              }}
              active={editor.isActive("link")}
            >
              <LinkIcon />
            </ToolbarButton>
            <ToolbarButton
              title="Изображение по URL"
              onClick={() => {
                const url = window.prompt("URL изображения", "https://");

                if (!url?.trim()) {
                  return;
                }

                editor.chain().focus().setImage({ src: url.trim() }).run();
              }}
            >
              <ImageIcon />
            </ToolbarButton>
            <ToolbarButton
              title="Таблица 3x3"
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              active={editor.isActive("table")}
            >
              <TableIcon />
            </ToolbarButton>
            <ToolbarButton title="Горизонтальная линия" onClick={() => editor.chain().focus().setHorizontalRule().run()}><HrIcon /></ToolbarButton>
            <ToolbarButton title="Удалить таблицу" onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.isActive("table")}><TableDeleteIcon /></ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton title="Отменить" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}><UndoIcon /></ToolbarButton>
            <ToolbarButton title="Повторить" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}><RedoIcon /></ToolbarButton>
          </div>
        ) : null}
      </div>
      {mode === "visual" ? (
        <EditorContent editor={editor} />
      ) : (
        <textarea
          value={codeValue}
          onChange={(event) => applyCodeModeValue(event.target.value)}
          className="min-h-[320px] w-full border-0 bg-white px-4 py-4 font-mono text-[14px] leading-7 text-zinc-800 outline-none dark:bg-[#08110b] dark:text-zinc-200"
          spellCheck={false}
        />
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
      {children}
    </label>
  );
}

const inputClassName = "w-full border border-black/10 bg-white px-4 py-3 text-[15px] text-zinc-900 outline-none transition-colors focus:border-black/40 dark:border-white/10 dark:bg-[#08110b] dark:text-zinc-100 dark:focus:border-white/40";
const fileInputClassName = "block w-full border border-black/10 bg-white text-sm text-zinc-900 outline-none transition-colors focus:border-black/40 file:mr-4 file:border-0 file:border-r file:border-black/10 file:bg-black file:px-4 file:py-3 file:text-sm file:font-medium file:text-white file:transition-colors hover:file:bg-zinc-800 dark:border-white/10 dark:bg-[#08110b] dark:text-zinc-100 dark:focus:border-white/40 dark:file:border-white/10 dark:file:bg-white dark:file:text-[#08110b] dark:hover:file:bg-zinc-200";
const panelClassName = "border border-black/10 bg-white dark:border-white/10 dark:bg-[#08110b]";

const EDITOR_TYPE_ORDER: Record<EditorContentType, number> = {
  news: 0,
  article: 1,
  video: 2,
  homepage: 3,
};

const EDITOR_TYPE_LABELS: Record<EditorContentType, string> = {
  news: "Новости",
  article: "Статьи",
  video: "Видео",
  homepage: "Инфографика",
};

function sortEditorTypes(types: EditorContentType[]) {
  return [...types].sort((left, right) => EDITOR_TYPE_ORDER[left] - EDITOR_TYPE_ORDER[right]);
}

type AccountEditorProps = {
  initialQuery?: {
    type?: string;
    documentId?: string;
  };
};

export function AccountEditor({ initialQuery }: AccountEditorProps) {
  const itemsPerPage = 20;
  const [session, setSession] = useState<EditorSession | null>(null);
  const [authors, setAuthors] = useState<EditorAuthorOption[]>([]);
  const [categories, setCategories] = useState<EditorTaxonomyOption[]>([]);
  const [tags, setTags] = useState<EditorTaxonomyOption[]>([]);
  const [mediaAssets, setMediaAssets] = useState<UploadedAsset[]>([]);
  const [items, setItems] = useState<Record<EditorContentType, EditorEntrySummary[]>>({
    article: [],
    news: [],
    video: [],
    homepage: [],
  });
  const [selectedType, setSelectedType] = useState<EditorContentType>("article");
  const [form, setForm] = useState<FormState>(createInitialState("article"));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [itemsQuery, setItemsQuery] = useState("");
  const [itemsPage, setItemsPage] = useState(1);
  const [activeInfographicVersion, setActiveInfographicVersion] = useState<EditorInfographicVersion>("desktop");
  const [activeMediaPanel, setActiveMediaPanel] = useState<{
    kind: "cover" | "block-highlight" | "infographic-image" | "infographic-video" | "infographic-corner-icon";
    blockIndex?: number;
    cardIndex?: number;
  } | null>(null);

  const allowedTypes = useMemo(() => sortEditorTypes(session?.capabilities.canCreate ?? []), [session]);
  const canEditAll = session?.capabilities.canEditAll === true;
  const materialPublicPath = publicPath(selectedType, form.slug);
  const materialPreviewPath = previewPath(selectedType, form.slug);
  const requestedType = useMemo(() => {
    const rawType = initialQuery?.type?.trim() ?? "";
    return isEditorContentType(rawType) ? rawType : null;
  }, [initialQuery?.type]);
  const requestedDocumentId = initialQuery?.documentId?.trim() || null;
  const activeInfographicCards = useMemo(() => {
    if (activeInfographicVersion === "desktop") {
      return form.infographicCardsDesktop;
    }

    if (activeInfographicVersion === "tablet") {
      return form.infographicCardsTablet;
    }

    return form.infographicCardsMobile;
  }, [activeInfographicVersion, form.infographicCardsDesktop, form.infographicCardsMobile, form.infographicCardsTablet]);
  const sessionRoleLabel = getAuthModeLabel(resolveAuthMode({
    accountType: session?.user?.memberProfile?.accountType ?? null,
  }));
  const filteredItems = useMemo(() => {
    const query = itemsQuery.trim().toLowerCase();
    const source = items[selectedType] ?? [];

    if (!query) {
      return source;
    }

    return source.filter((item) => item.title.toLowerCase().includes(query));
  }, [items, itemsQuery, selectedType]);
  const totalItemsPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const startIndex = (itemsPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, itemsPage]);
  const coverAsset = useMemo(() => findAssetById(mediaAssets, form.cover, "image"), [form.cover, mediaAssets]);
  const highlightBlock = activeMediaPanel?.kind === "block-highlight" && typeof activeMediaPanel.blockIndex === "number"
    ? form.blocks[activeMediaPanel.blockIndex]
    : null;
  const activePanelAsset = useMemo(() => {
    if (!activeMediaPanel) {
      return null;
    }

    if (activeMediaPanel.kind === "cover") {
      return coverAsset;
    }

    if (highlightBlock?.__component === "blocks.image-highlight") {
      return findAssetById(mediaAssets, highlightBlock.image, "image");
    }

    if (typeof activeMediaPanel.cardIndex === "number") {
      const card = activeInfographicCards[activeMediaPanel.cardIndex];

      if (activeMediaPanel.kind === "infographic-corner-icon") {
        return findAssetById(mediaAssets, card?.cornerIcon ?? null, "image");
      }

      if (activeMediaPanel.kind === "infographic-image") {
        return findAssetById(mediaAssets, card?.backgroundImage ?? null, "image");
      }

      if (activeMediaPanel.kind === "infographic-video") {
        return findAssetById(mediaAssets, card?.backgroundVideo ?? null, "video");
      }
    }

    return null;
  }, [activeInfographicCards, activeMediaPanel, coverAsset, highlightBlock, mediaAssets]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const sessionResponse = await fetch("/api/editor/session", { cache: "no-store" });
        const sessionPayload = await parseJson<EditorSession | EditorApiError>(sessionResponse);

        if (!sessionResponse.ok || !sessionPayload || !("capabilities" in sessionPayload)) {
          throw new Error(getErrorMessage(sessionPayload as EditorApiError | null, "Не удалось открыть кабинет."));
        }

        if (cancelled) {
          return;
        }

        setSession(sessionPayload);

        const creatableTypes = sessionPayload.capabilities.canCreate ?? [];

        if (!creatableTypes.length) {
          setAuthors([]);
          setCategories([]);
          setTags([]);
          setMediaAssets([]);
          setItems({
            article: [],
            news: [],
            video: [],
            homepage: [],
          });
          setError("У вашей учетной записи пока нет доступа к созданию или редактированию материалов.");
          return;
        }

        try {
          if (sessionPayload.capabilities.canEditAll) {
            const authorsResponse = await fetch("/api/editor/authors", { cache: "no-store" });
            const authorsPayload = await parseJson<EditorAuthorOption[] | EditorApiError>(authorsResponse);

            if (!cancelled && authorsResponse.ok && Array.isArray(authorsPayload)) {
              setAuthors(authorsPayload);
            }
          } else if (!cancelled) {
            setAuthors([]);
          }
        } catch {
          if (!cancelled) {
            setAuthors([]);
          }
        }

        try {
          const [categoriesResponse, tagsResponse] = await Promise.all([
            fetch("/api/editor/categories", { cache: "no-store" }),
            fetch("/api/editor/tags", { cache: "no-store" }),
          ]);
          const [categoriesPayload, tagsPayload] = await Promise.all([
            parseJson<EditorTaxonomyOption[] | EditorApiError>(categoriesResponse),
            parseJson<EditorTaxonomyOption[] | EditorApiError>(tagsResponse),
          ]);

          if (!cancelled && categoriesResponse.ok && Array.isArray(categoriesPayload)) {
            setCategories(categoriesPayload);
          }

          if (!cancelled && tagsResponse.ok && Array.isArray(tagsPayload)) {
            setTags(tagsPayload);
          }
        } catch {
          if (!cancelled) {
            setCategories([]);
            setTags([]);
          }
        }

        if (sessionPayload.capabilities.canUseEditor) {
          try {
            const mediaResponse = await fetch("/api/editor/media", { cache: "no-store" });
            const mediaPayload = await parseJson<UploadedAsset[] | EditorApiError>(mediaResponse);

            if (!cancelled && mediaResponse.ok && Array.isArray(mediaPayload)) {
              setMediaAssets(mediaPayload);
            }
          } catch {
            if (!cancelled) {
              setMediaAssets([]);
            }
          }
        } else if (!cancelled) {
          setMediaAssets([]);
        }

        const orderedCreatableTypes = sortEditorTypes(creatableTypes);
        const initialType = orderedCreatableTypes[0] ?? "article";
        setSelectedType(initialType);
        setForm(createInitialState(initialType));

        const loadedEntries = await Promise.all(
          orderedCreatableTypes.map(async (type) => {
            const response = await fetch(`/api/editor/content/${type}`, { cache: "no-store" });
            const payload = await parseJson<EditorEntrySummary[] | EditorApiError>(response);

            if (!response.ok || !Array.isArray(payload)) {
              throw new Error(getErrorMessage(payload as EditorApiError | null, `Не удалось загрузить список ${type}.`));
            }

            return [type, payload] as const;
          }),
        );

        if (cancelled) {
          return;
        }

        setItems((current) => {
          const next = { ...current };

          for (const [type, payload] of loadedEntries) {
            next[type] = payload;
          }

          return next;
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Не удалось открыть кабинет.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setItemsPage(1);
  }, [itemsQuery, selectedType]);

  useEffect(() => {
    if (requestedType || requestedDocumentId || selectedType !== "homepage" || form.documentId || items.homepage.length !== 1) {
      return;
    }

    void openEntry("homepage", items.homepage[0].documentId);
  }, [form.documentId, items.homepage, requestedDocumentId, requestedType, selectedType]);

  useEffect(() => {
    if (loading || !requestedType || !requestedDocumentId || !allowedTypes.includes(requestedType)) {
      return;
    }

    if (selectedType === requestedType && form.documentId === requestedDocumentId) {
      return;
    }

    void openEntry(requestedType, requestedDocumentId);
  }, [allowedTypes, form.documentId, loading, requestedDocumentId, requestedType, selectedType]);

  useEffect(() => {
    if (itemsPage > totalItemsPages) {
      setItemsPage(totalItemsPages);
    }
  }, [itemsPage, totalItemsPages]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateMultiSelect(key: "categories" | "tags", values: string[]) {
    updateForm(key, values.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0));
  }

  function updateSource(index: number, key: keyof SourceItem, value: string) {
    setForm((current) => ({
      ...current,
      sources: current.sources.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  }

  function addSource() {
    setForm((current) => ({
      ...current,
      sources: [...current.sources, { name: "", url: "" }],
    }));
  }

  function removeSource(index: number) {
    setForm((current) => ({
      ...current,
      sources: current.sources.length > 1 ? current.sources.filter((_, itemIndex) => itemIndex !== index) : [{ name: "", url: "" }],
    }));
  }

  function publicPath(type: EditorContentType, slug: string) {
    if (!slug.trim()) {
      return type === "homepage" ? "/" : null;
    }

    return type === "article" ? `/articles/${slug}` : type === "news" ? `/news/${slug}` : type === "video" ? `/videos/${slug}` : null;
  }

  function previewPath(type: EditorContentType, slug: string) {
    const publicUrl = publicPath(type, slug);

    if (!publicUrl || type === "homepage") {
      return null;
    }

    const query = new URLSearchParams({
      type,
      slug: slug.trim(),
    });

    return `/api/preview?${query.toString()}`;
  }

  function updateSeo<K extends keyof EditorSeo>(key: K, value: EditorSeo[K]) {
    setForm((current) => ({
      ...current,
      seo: {
        ...current.seo,
        [key]: value,
      },
    }));
  }

  function updateBlock(index: number, nextBlock: EditorBlock) {
    setForm((current) => ({
      ...current,
      blocks: current.blocks.map((block, currentIndex) => (currentIndex === index ? nextBlock : block)),
    }));
  }

  function addBlock(type: EditorBlock["__component"]) {
    let nextBlock: EditorBlock;

    if (type === "blocks.html-editor") {
      nextBlock = { __component: type, title: "", content: createEmptyTiptapDocument() };
    } else if (type === "blocks.embed") {
      nextBlock = { ...EMPTY_EMBED_BLOCK };
    } else if (type === "blocks.image-highlight") {
      nextBlock = { __component: type, caption: "", credit: "", image: null };
    } else {
      nextBlock = { __component: type, title: "", description: "", images: [] };
    }

    setForm((current) => ({ ...current, blocks: [...current.blocks, nextBlock] }));
  }

  function removeBlock(index: number) {
    setForm((current) => ({
      ...current,
      blocks: current.blocks.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setForm((current) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= current.blocks.length) {
        return current;
      }

      const nextBlocks = [...current.blocks];
      const [block] = nextBlocks.splice(index, 1);
      nextBlocks.splice(nextIndex, 0, block);

      return { ...current, blocks: nextBlocks };
    });
  }

  function openCoverMediaPanel() {
    setActiveMediaPanel({ kind: "cover" });
  }

  function openHighlightMediaPanel(blockIndex: number) {
    setActiveMediaPanel({ kind: "block-highlight", blockIndex });
  }

  function closeMediaPanel() {
    setActiveMediaPanel(null);
  }

  function updateInfographicCard(index: number, nextCard: EditorInfographicCard) {
    setForm((current) => ({
      ...current,
      ...(activeInfographicVersion === "desktop"
        ? { infographicCardsDesktop: current.infographicCardsDesktop.map((card, currentIndex) => (currentIndex === index ? nextCard : card)) }
        : activeInfographicVersion === "tablet"
          ? { infographicCardsTablet: current.infographicCardsTablet.map((card, currentIndex) => (currentIndex === index ? nextCard : card)) }
          : { infographicCardsMobile: current.infographicCardsMobile.map((card, currentIndex) => (currentIndex === index ? nextCard : card)) }),
    }));
  }

  function openInfographicMediaPanel(kind: "infographic-image" | "infographic-video" | "infographic-corner-icon", cardIndex: number) {
    setActiveMediaPanel({ kind, cardIndex });
  }

  function selectAssetFromPanel(id: number | null) {
    if (!activeMediaPanel) {
      return;
    }

    if (activeMediaPanel.kind === "cover") {
      updateForm("cover", id);
      return;
    }

    if (activeMediaPanel.kind === "block-highlight" && typeof activeMediaPanel.blockIndex === "number") {
      const block = form.blocks[activeMediaPanel.blockIndex];

      if (block?.__component === "blocks.image-highlight") {
        updateBlock(activeMediaPanel.blockIndex, { ...block, image: id });
      }

      return;
    }

    if (typeof activeMediaPanel.cardIndex === "number") {
      const card = activeInfographicCards[activeMediaPanel.cardIndex];

      if (!card) {
        return;
      }

      if (activeMediaPanel.kind === "infographic-corner-icon") {
        updateInfographicCard(activeMediaPanel.cardIndex, { ...card, cornerIcon: id });
        return;
      }

      if (activeMediaPanel.kind === "infographic-image") {
        updateInfographicCard(activeMediaPanel.cardIndex, { ...card, backgroundImage: id });
        return;
      }

      if (activeMediaPanel.kind === "infographic-video") {
        updateInfographicCard(activeMediaPanel.cardIndex, { ...card, backgroundVideo: id });
      }
    }
  }

  async function refreshType(type: EditorContentType) {
    const response = await fetch(`/api/editor/content/${type}`, { cache: "no-store" });
    const payload = await parseJson<EditorEntrySummary[] | EditorApiError>(response);

    if (!response.ok || !Array.isArray(payload)) {
      throw new Error(getErrorMessage(payload as EditorApiError | null, "Не удалось обновить список материалов."));
    }

    setItems((current) => ({ ...current, [type]: payload }));
  }

  async function openEntry(type: EditorContentType, documentId: string) {
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/editor/content/${type}/${documentId}`, { cache: "no-store" });
    const payload = await parseJson<EditorEntryPayload>(response);

    if (!response.ok || !payload) {
      setError(getErrorMessage(payload as EditorApiError | null, "Не удалось открыть материал."));
      return;
    }

    setSelectedType(type);
    setForm(normalizeFormState(type, payload));
  }

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);

    try {
      const id = await uploadFile(file);
      updateForm("cover", id);
      const mediaPayload = await refreshMediaAssets();
      if (mediaPayload) {
        setMediaAssets(mediaPayload);
      }
      openCoverMediaPanel();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Не удалось загрузить обложку.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleInfographicUpload(cardIndex: number, kind: "infographic-image" | "infographic-video" | "infographic-corner-icon", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);

    try {
      const id = await uploadFile(file);
      const card = activeInfographicCards[cardIndex];

      if (!card) {
        return;
      }

      updateInfographicCard(cardIndex, kind === "infographic-image"
        ? { ...card, backgroundImage: id }
        : kind === "infographic-corner-icon"
          ? { ...card, cornerIcon: id }
          : { ...card, backgroundVideo: id });

      const mediaPayload = await refreshMediaAssets();
      if (mediaPayload) {
        setMediaAssets(mediaPayload);
      }

      openInfographicMediaPanel(kind, cardIndex);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : kind === "infographic-video" ? "Не удалось загрузить видео." : "Не удалось загрузить изображение.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleBlockFiles(index: number, event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    setError(null);

    try {
      const uploadedIds = await Promise.all(files.map((file) => uploadFile(file)));
      const block = form.blocks[index];

      if (!block) {
        return;
      }

      if (block.__component === "blocks.image-highlight") {
        updateBlock(index, { ...block, image: uploadedIds[0] ?? null });
        const mediaPayload = await refreshMediaAssets();
        if (mediaPayload) {
          setMediaAssets(mediaPayload);
        }
        openHighlightMediaPanel(index);
        return;
      }

      if (isMediaCollectionBlock(block)) {
        updateBlock(index, {
          ...block,
          images: [...block.images, ...uploadedIds],
        });

        const mediaPayload = await refreshMediaAssets();
        if (mediaPayload) {
          setMediaAssets(mediaPayload);
        }
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Не удалось загрузить изображение.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        data: selectedType === "homepage"
          ? {
              infographicTitle: form.infographicTitle,
              infographicDescription: form.infographicDescription,
              infographicCardsDesktop: form.infographicCardsDesktop.map((card) => ({
                id: card.id,
                shape: card.shape,
                title: card.title,
                description: card.description,
                href: card.href,
                backgroundImage: card.backgroundImage,
                backgroundVideo: card.backgroundVideo,
                cornerIcon: card.cornerIcon,
                accentText: card.accentText,
                theme: card.theme,
              })),
              infographicCardsTablet: form.infographicCardsTablet.map((card) => ({
                id: card.id,
                shape: card.shape,
                title: card.title,
                description: card.description,
                href: card.href,
                backgroundImage: card.backgroundImage,
                backgroundVideo: card.backgroundVideo,
                cornerIcon: card.cornerIcon,
                accentText: card.accentText,
                theme: card.theme,
              })),
              infographicCardsMobile: form.infographicCardsMobile.map((card) => ({
                id: card.id,
                shape: card.shape,
                title: card.title,
                description: card.description,
                href: card.href,
                backgroundImage: card.backgroundImage,
                backgroundVideo: card.backgroundVideo,
                cornerIcon: card.cornerIcon,
                accentText: card.accentText,
                theme: card.theme,
              })),
            }
          : {
              title: form.title,
              slug: form.slug,
              excerpt: form.excerpt,
              cover: form.cover,
              author: form.author,
              categories: form.categories,
              tags: form.tags,
              homepageSpecialBlock: form.homepageSpecialBlock,
              status: form.status,
              publishedAtCustom: form.publishedAtCustom ? new Date(form.publishedAtCustom).toISOString() : new Date().toISOString(),
              readingTime: form.readingTime,
              coverSource: form.coverSource,
              ...(selectedType === "video"
                ? {}
                : {
                    sources: form.sources.filter((item) => item.name.trim() || item.url.trim()),
                  }),
              startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : "",
              endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : "",
              locationName: form.locationName,
              city: form.city,
              address: form.address,
              ticketUrl: form.ticketUrl,
              videoUrl: form.videoUrl,
              duration: form.duration,
              seo: form.seo,
              blocks: form.blocks.map((block) => {
                if (block.__component !== "blocks.html-editor") {
                  return block;
                }

                return {
                  ...block,
                  content: serializeTiptapDocument(block.content),
                };
              }),
            },
      };

      const endpoint = form.documentId
        ? `/api/editor/content/${selectedType}/${form.documentId}`
        : `/api/editor/content/${selectedType}`;

      const response = await fetch(endpoint, {
        method: form.documentId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const saved = await parseJson<EditorEntryPayload>(response);

      if (!response.ok || !saved?.documentId) {
        throw new Error(getErrorMessage(saved as EditorApiError | null, "Не удалось сохранить материал."));
      }

      setForm(normalizeFormState(selectedType, saved));
      await refreshType(selectedType);
      setSuccess(selectedType === "homepage" ? "Настройки инфографики обновлены." : form.documentId ? "Материал обновлён." : "Материал создан.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось сохранить материал.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!form.documentId) {
      return;
    }

    if (!window.confirm("Удалить этот материал?")) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/editor/content/${selectedType}/${form.documentId}`, {
        method: "DELETE",
      });
      const payload = await parseJson<{ ok?: boolean } | EditorApiError>(response);

      if (!response.ok || !payload || ("ok" in payload && payload.ok !== true)) {
        throw new Error(getErrorMessage(payload as EditorApiError | null, "Не удалось удалить материал."));
      }

      await refreshType(selectedType);
      setForm(createInitialState(selectedType));
      setSuccess("Материал удалён.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Не удалось удалить материал.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className={`${panelClassName} px-5 py-4`}>Загружаем кабинет…</div>;
  }

  if (error && !session) {
    return <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">{error}</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className={`${panelClassName} h-fit space-y-0`}>
        <div className="space-y-2 border-b border-black/10 px-5 py-5 dark:border-white/10">
          <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Профиль</p>
          <h2 className="text-2xl font-semibold tracking-tight">{session.user?.memberProfile?.displayName || session.user?.username}</h2>
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">Роль: {sessionRoleLabel}</p>
        </div>

        <div className="space-y-3 border-b border-black/10 px-5 py-5 dark:border-white/10">
          <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Тип материала</p>
          <div className="grid gap-px border border-black/10 bg-black/10 dark:border-white/10 dark:bg-white/10">
            {allowedTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedType(type);
                  setItemsQuery("");
                  setItemsPage(1);
                  setForm(createInitialState(type));
                  setError(null);
                  setSuccess(null);
                }}
                className={`px-4 py-3 text-left text-sm font-medium transition-colors ${selectedType === type ? "bg-black text-white dark:bg-white dark:text-[#08110b]" : "bg-white text-zinc-700 hover:bg-black/[0.03] hover:text-zinc-900 dark:bg-[#08110b] dark:text-zinc-200 dark:hover:bg-white/[0.04] dark:hover:text-white"}`}
              >
                {EDITOR_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {selectedType !== "homepage" ? (
          <button
            type="button"
            onClick={() => {
              setForm(createInitialState(selectedType));
              setError(null);
              setSuccess(null);
            }}
            className="inline-flex w-full items-center justify-center gap-2 border border-black bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 hover:border-zinc-800 dark:border-white dark:bg-white dark:text-[#08110b] dark:hover:bg-zinc-200 dark:hover:border-zinc-200"
          >
            <PlusIcon />
            Новый материал
          </button>
        ) : null}

        <div className="space-y-3 px-5 py-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">{canEditAll ? "Все материалы" : "Мои материалы"}</p>
          <input
            value={itemsQuery}
            onChange={(event) => setItemsQuery(event.target.value)}
            className={inputClassName}
            placeholder="Фильтр по заголовку"
          />
          <div className="grid gap-px border border-black/10 bg-black/10 dark:border-white/10 dark:bg-white/10">
            {paginatedItems.map((item) => (
              <button
                key={item.documentId}
                type="button"
                onClick={() => void openEntry(selectedType, item.documentId)}
                className="bg-white px-4 py-3 text-left transition-colors hover:bg-black/[0.03] dark:bg-[#08110b] dark:hover:bg-white/[0.04]"
              >
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.title}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">{item.status === "published" ? "Опубликовано" : "Черновик"}</div>
              </button>
            ))}
            {!filteredItems.length ? <p className="bg-white px-4 py-3 text-sm text-zinc-500 dark:bg-[#08110b] dark:text-zinc-400">Ничего не найдено.</p> : null}
          </div>
          {filteredItems.length ? (
            <div className="flex items-center justify-between gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              <span>
                Стр. {itemsPage} из {totalItemsPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setItemsPage((current) => Math.max(1, current - 1))}
                  disabled={itemsPage === 1}
                  className="inline-flex items-center justify-center border border-black/10 px-3 py-2 transition-colors hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/[0.04]"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() => setItemsPage((current) => Math.min(totalItemsPages, current + 1))}
                  disabled={itemsPage === totalItemsPages}
                  className="inline-flex items-center justify-center border border-black/10 px-3 py-2 transition-colors hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/[0.04]"
                >
                  Вперёд
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      <section className={`${panelClassName} space-y-6 p-5`}>
        <header className="space-y-2 border-b border-black/10 pb-5 dark:border-white/10">
          <p className="type-caption text-zinc-500 dark:text-zinc-400">Редактор материала</p>
          <h1 className="type-h2">{selectedType === "homepage" ? "Настройки инфографики" : form.documentId ? "Редактирование" : "Создание материала"}</h1>
          <p className="type-body max-w-3xl text-zinc-600 dark:text-zinc-400">
            {selectedType === "homepage"
              ? "Здесь показывается единственная системная запись homepage с настройками инфографики. Новые записи не создаются, удаление недоступно."
              : "Полноценное редактирование контента с блоками и rich text в одном рабочем интерфейсе."}
          </p>
          <div className="flex flex-wrap gap-3">
            {form.status === "draft" && materialPreviewPath ? (
              <Link href={materialPreviewPath} target="_blank" className="inline-flex w-fit items-center justify-center gap-2 border border-amber-600 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 hover:text-amber-900 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-300">
                Предпросмотр
              </Link>
            ) : null}
            {materialPublicPath && form.status === "published" ? (
              <Link href={materialPublicPath} target="_blank" className="inline-flex w-fit items-center justify-center gap-2 border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300">
                Перейти к материалу
              </Link>
            ) : null}
          </div>
        </header>

        {selectedType === "homepage" ? (
          <section className="space-y-4">
            <div className="border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-100">
              Раздел работает в режиме singleton: он показывает реальные данные из модели <span className="font-medium">homepage</span>. Создание и удаление отдельных записей инфографики недоступно по модели данных.
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Заголовок секции инфографики">
                <input value={form.infographicTitle} onChange={(event) => updateForm("infographicTitle", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Описание секции инфографики">
                <textarea value={form.infographicDescription} onChange={(event) => updateForm("infographicDescription", event.target.value)} rows={4} className={inputClassName} />
              </Field>
            </div>

            <section className="space-y-4 border-t border-black/10 pt-6 dark:border-white/10">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Карточки инфографики</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">У каждой версии свой независимый набор карточек. Переключатель ниже меняет только редактируемую версию.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {INFOGRAPHIC_VIEWPORTS.map((version) => {
                  const isActive = activeInfographicVersion === version;

                  return (
                    <button
                      key={version}
                      type="button"
                      onClick={() => setActiveInfographicVersion(version)}
                      className={isActive
                        ? "inline-flex items-center justify-center border border-black bg-black px-4 py-2 text-sm font-medium text-white dark:border-white dark:bg-white dark:text-[#08110b]"
                        : "inline-flex items-center justify-center border border-black/10 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-black/[0.03] dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/[0.04]"}
                    >
                      {INFOGRAPHIC_VIEWPORT_LABELS[version]} ({INFOGRAPHIC_VIEWPORT_CARD_COUNTS[version]})
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4">
                {(activeInfographicVersion === "desktop"
                  ? form.infographicCardsDesktop
                  : activeInfographicVersion === "tablet"
                    ? form.infographicCardsTablet
                    : form.infographicCardsMobile).map((card, index) => {
                  const imageAsset = findAssetById(mediaAssets, card.backgroundImage ?? null, "image");
                  const videoAsset = findAssetById(mediaAssets, card.backgroundVideo ?? null, "video");
                  const cornerIconAsset = findAssetById(mediaAssets, card.cornerIcon ?? null, "image");

                  return (
                    <div key={`infographic-card-${card.id ?? index}`} className="border border-black/10 p-4 dark:border-white/10">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold tracking-tight">Карточка {index + 1}</h3>
                        <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Версия {INFOGRAPHIC_VIEWPORT_LABELS[activeInfographicVersion]}</div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Field label="Форма">
                          <select value={card.shape ?? "square"} onChange={(event) => updateInfographicCard(index, { ...card, shape: event.target.value as EditorInfographicCard["shape"] })} className={inputClassName}>
                            <option value="square">Квадрат</option>
                            <option value="rectangle">Прямоугольник</option>
                            <option value="circle">Круг</option>
                          </select>
                        </Field>
                        <Field label="Тема">
                          <select value={card.theme ?? "light"} onChange={(event) => updateInfographicCard(index, { ...card, theme: event.target.value as EditorInfographicCard["theme"] })} className={inputClassName}>
                            <option value="light">Светлая</option>
                            <option value="dark">Тёмная</option>
                          </select>
                        </Field>
                        <Field label="Заголовок">
                          <input value={card.title ?? ""} onChange={(event) => updateInfographicCard(index, { ...card, title: event.target.value })} className={inputClassName} />
                        </Field>
                        <Field label="Ссылка">
                          <input value={card.href ?? ""} onChange={(event) => updateInfographicCard(index, { ...card, href: event.target.value })} className={inputClassName} placeholder="/path или https://..." />
                        </Field>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Field label="Описание">
                          <textarea value={card.description ?? ""} onChange={(event) => updateInfographicCard(index, { ...card, description: event.target.value })} rows={4} className={inputClassName} />
                        </Field>
                        <Field label="Акцентный текст">
                          <textarea value={card.accentText ?? ""} onChange={(event) => updateInfographicCard(index, { ...card, accentText: event.target.value })} rows={4} className={inputClassName} />
                        </Field>
                      </div>

                      <div className="mt-4 grid gap-4 xl:grid-cols-2">
                        <Field label="SVG-иконка в угол">
                          <MediaSummaryCard
                            asset={cornerIconAsset}
                            accept="image"
                            emptyLabel="SVG-иконка не выбрана"
                            onOpen={() => openInfographicMediaPanel("infographic-corner-icon", index)}
                            onClear={() => updateInfographicCard(index, { ...card, cornerIcon: null })}
                            openLabel="Открыть библиотеку"
                          />
                        </Field>
                        <Field label="Фоновое изображение">
                          <MediaSummaryCard
                            asset={imageAsset}
                            accept="image"
                            emptyLabel="Изображение не выбрано"
                            onOpen={() => openInfographicMediaPanel("infographic-image", index)}
                            onClear={() => updateInfographicCard(index, { ...card, backgroundImage: null })}
                            openLabel="Открыть библиотеку"
                          />
                        </Field>
                        <Field label="Фоновое видео">
                          <MediaSummaryCard
                            asset={videoAsset}
                            accept="video"
                            emptyLabel="Видео не выбрано"
                            onOpen={() => openInfographicMediaPanel("infographic-video", index)}
                            onClear={() => updateInfographicCard(index, { ...card, backgroundVideo: null })}
                            openLabel="Открыть библиотеку"
                          />
                        </Field>
                      </div>
                    </div>
                  );
                })}

                {!(activeInfographicVersion === "desktop"
                  ? form.infographicCardsDesktop
                  : activeInfographicVersion === "tablet"
                    ? form.infographicCardsTablet
                    : form.infographicCardsMobile).length ? (
                  <div className="border border-dashed border-black/10 px-4 py-6 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                    Для этой версии сейчас нет карточек инфографики.
                  </div>
                ) : null}
              </div>
            </section>
          </section>
        ) : null}

        {selectedType !== "homepage" ? (
          <>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Заголовок"><input value={form.title} onChange={(event) => updateForm("title", event.target.value)} className={inputClassName} /></Field>
          <Field label="Ссылка"><input value={form.slug} onChange={(event) => updateForm("slug", event.target.value)} className={inputClassName} placeholder="Можно оставить пустым" /></Field>
        </div>

        <Field label="Краткое описание">
          <textarea value={form.excerpt} onChange={(event) => updateForm("excerpt", event.target.value)} rows={4} className={inputClassName} />
        </Field>

          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
            <div className="grid gap-4">
              <Field label="Статус">
                <select value={form.status} onChange={(event) => updateForm("status", event.target.value as FormState["status"])} className={inputClassName}>
                  <option value="draft">Черновик</option>
                <option value="published">Опубликовать</option>
              </select>
            </Field>
            <Field label="Дата публикации">
              <input type="datetime-local" value={form.publishedAtCustom} onChange={(event) => updateForm("publishedAtCustom", event.target.value)} className={inputClassName} />
            </Field>
            {canEditAll ? (
              <Field label="Автор">
                <select value={form.author ?? ""} onChange={(event) => updateForm("author", event.target.value ? Number(event.target.value) : null)} className={inputClassName}>
                  <option value="">Без автора</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>{author.name}</option>
                  ))}
                </select>
              </Field>
            ) : null}

            {canEditAll ? (
              <Field label="Главная">
                <label className="flex items-center gap-3 rounded-none border border-black/10 px-3 py-3 text-sm text-zinc-700 dark:border-white/10 dark:text-zinc-200">
                  <input
                    type="checkbox"
                    checked={form.homepageSpecialBlock}
                    onChange={(event) => updateForm("homepageSpecialBlock", event.target.checked)}
                    className="h-4 w-4 rounded-none border-black/20 text-black focus:ring-black dark:border-white/20 dark:bg-[#08110b] dark:text-white dark:focus:ring-white"
                  />
                  <span>Вывести на главную в спецблок</span>
                </label>
              </Field>
            ) : null}
          </div>
          <div>
            <Field label="Обложка">
              <div className="grid gap-3">
                <input type="file" accept="image/*" onChange={(event) => void handleCoverUpload(event)} className={fileInputClassName} />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {coverAsset ? `Выбран файл: ${coverAsset.name || `Файл #${coverAsset.id}`}` : "Файл не выбран. Можно загрузить новую обложку или выбрать уже загруженную в библиотеке."}
                </p>
                <MediaSummaryCard
                  asset={coverAsset}
                  accept="image"
                  emptyLabel="Обложка не выбрана"
                  onOpen={openCoverMediaPanel}
                  onClear={() => updateForm("cover", null)}
                  openLabel="Открыть библиотеку"
                />
              </div>
            </Field>
          </div>
          <div>
            <Field label="Источник фото">
              <input
                value={form.coverSource}
                onChange={(event) => updateForm("coverSource", event.target.value)}
                className={inputClassName}
                placeholder="Например: Фото автора, Unsplash, архив бренда"
              />
            </Field>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Рубрики">
            <select multiple value={form.categories.map(String)} onChange={(event) => updateMultiSelect("categories", Array.from(event.target.selectedOptions).map((option) => option.value))} className={`${inputClassName} min-h-[180px]`}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Теги">
            <select multiple value={form.tags.map(String)} onChange={(event) => updateMultiSelect("tags", Array.from(event.target.selectedOptions).map((option) => option.value))} className={`${inputClassName} min-h-[180px]`}>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </Field>
        </div>

        {selectedType === "article" ? (
          <div className="space-y-4">
            <div className="max-w-xs">
              <Field label="Время чтения, мин"><input type="number" min={1} value={form.readingTime} onChange={(event) => updateForm("readingTime", event.target.value)} className={inputClassName} /></Field>
            </div>
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Источники</p>
                <button type="button" onClick={addSource} className="inline-flex items-center gap-2 border border-black/10 px-3 py-2 text-sm transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"><PlusIcon /> Добавить источник</button>
              </div>
              <div className="grid gap-3">
                {form.sources.map((source, index) => (
                  <div key={`article-source-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <input value={source.name} onChange={(event) => updateSource(index, "name", event.target.value)} className={inputClassName} placeholder="Название источника" />
                    <input value={source.url} onChange={(event) => updateSource(index, "url", event.target.value)} className={inputClassName} placeholder="https://example.com" />
                    <button type="button" onClick={() => removeSource(index)} className="inline-flex items-center justify-center border border-red-200 px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30">Удалить</button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {selectedType === "news" ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Источники</p>
              <button type="button" onClick={addSource} className="inline-flex items-center gap-2 border border-black/10 px-3 py-2 text-sm transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"><PlusIcon /> Добавить источник</button>
            </div>
            <div className="grid gap-3">
              {form.sources.map((source, index) => (
                <div key={`news-source-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <input value={source.name} onChange={(event) => updateSource(index, "name", event.target.value)} className={inputClassName} placeholder="Название источника" />
                  <input value={source.url} onChange={(event) => updateSource(index, "url", event.target.value)} className={inputClassName} placeholder="https://example.com" />
                  <button type="button" onClick={() => removeSource(index)} className="inline-flex items-center justify-center border border-red-200 px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30">Удалить</button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {selectedType === "video" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="URL видео"><input value={form.videoUrl} onChange={(event) => updateForm("videoUrl", event.target.value)} className={inputClassName} /></Field>
            <Field label="Длительность, мин"><input type="number" min={1} value={form.duration} onChange={(event) => updateForm("duration", event.target.value)} className={inputClassName} /></Field>
          </div>
        ) : null}

        <section className="space-y-4 border-t border-black/10 pt-6 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Блоки материала</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Используется проектный rich-text блок на TipTap плюс блоки изображений.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {EDITOR_BLOCK_TYPES.map((type) => (
                <button key={type} type="button" onClick={() => addBlock(type)} className="inline-flex items-center gap-2 border border-black/10 px-3 py-2 text-sm transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"><PlusIcon /> {blockLabel(type)}</button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {form.blocks.map((block, index) => (
              <div key={`${block.__component}-${index}`} className="border border-black/10 p-4 dark:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold tracking-tight">{index + 1}. {blockLabel(block.__component)}</h3>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" title="Переместить вверх" aria-label="Переместить вверх" onClick={() => moveBlock(index, -1)} className="inline-flex h-9 w-9 items-center justify-center border border-black/10 text-zinc-700 transition-colors hover:bg-black/[0.03] hover:text-zinc-900 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/[0.04] dark:hover:text-white"><ChevronUpIcon /></button>
                    <button type="button" title="Переместить вниз" aria-label="Переместить вниз" onClick={() => moveBlock(index, 1)} className="inline-flex h-9 w-9 items-center justify-center border border-black/10 text-zinc-700 transition-colors hover:bg-black/[0.03] hover:text-zinc-900 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/[0.04] dark:hover:text-white"><ChevronDownIcon /></button>
                    <button type="button" title="Удалить блок" aria-label="Удалить блок" onClick={() => removeBlock(index)} className="inline-flex h-9 w-9 items-center justify-center border border-red-200 text-red-700 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30"><TrashIcon /></button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4">
                  {block.__component === "blocks.html-editor" ? (
                    <>
                      <input value={block.title ?? ""} onChange={(event) => updateBlock(index, { ...block, title: event.target.value })} className={inputClassName} placeholder="Подзаголовок блока" />
                      <RichTextBlockEditor value={block.content} onChange={(value) => updateBlock(index, { ...block, content: value })} />
                    </>
                  ) : null}

                  {block.__component === "blocks.embed" ? (
                    <>
                      <input value={block.title ?? ""} onChange={(event) => updateBlock(index, { ...block, title: event.target.value })} className={inputClassName} placeholder="Подзаголовок блока" />
                      <textarea
                        value={block.html}
                        onChange={(event) => updateBlock(index, { ...block, html: event.target.value })}
                        rows={10}
                        className={inputClassName}
                        placeholder={'<iframe src="https://..."></iframe> или <script src="https://..."></script>'}
                      />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Этот блок предназначен только для embed-кода. Обычный текст и code block продолжат выводиться как текст.
                      </p>
                    </>
                  ) : null}

                  {block.__component === "blocks.image-gallery" || block.__component === "blocks.image-slider" ? (
                    <>
                      <input value={block.title ?? ""} onChange={(event) => updateBlock(index, { ...block, title: event.target.value })} className={inputClassName} placeholder="Заголовок блока" />
                      <textarea value={block.description ?? ""} onChange={(event) => updateBlock(index, { ...block, description: event.target.value })} rows={3} className={inputClassName} placeholder="Описание блока" />
                      <input type="file" accept="image/*" multiple onChange={(event) => void handleBlockFiles(index, event)} className={fileInputClassName} />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Загружено изображений: {block.images.length}</p>
                    </>
                  ) : null}

                  {block.__component === "blocks.image-highlight" ? (
                    <>
                      <input value={block.caption ?? ""} onChange={(event) => updateBlock(index, { ...block, caption: event.target.value })} className={inputClassName} placeholder="Подпись" />
                      <input value={block.credit ?? ""} onChange={(event) => updateBlock(index, { ...block, credit: event.target.value })} className={inputClassName} placeholder="Авторство / credit" />
                      <input type="file" accept="image/*" onChange={(event) => void handleBlockFiles(index, event)} className={fileInputClassName} />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Можно загрузить файл сразу или выбрать уже загруженное изображение в боковой панели.</p>
                      <MediaSummaryCard
                        asset={findAssetById(mediaAssets, block.image, "image")}
                        accept="image"
                        emptyLabel="Изображение не выбрано"
                        onOpen={() => openHighlightMediaPanel(index)}
                        onClear={() => updateBlock(index, { ...block, image: null })}
                        openLabel="Открыть библиотеку"
                      />
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
          </>
        ) : null}

        {selectedType !== "homepage" ? (
          <details className="border-t border-black/10 pt-6 dark:border-white/10">
          <summary className="cursor-pointer text-sm font-medium text-zinc-900 dark:text-zinc-100">SEO-настройки</summary>
          <div className="mt-4 grid gap-4">
            <Field label="Мета-заголовок">
              <input value={form.seo.metaTitle} onChange={(event) => updateSeo("metaTitle", event.target.value)} className={inputClassName} maxLength={70} />
            </Field>
            <Field label="Мета-описание">
              <textarea value={form.seo.metaDescription} onChange={(event) => updateSeo("metaDescription", event.target.value)} rows={4} className={inputClassName} maxLength={160} />
            </Field>
            <Field label="Ключевые слова">
              <textarea value={form.seo.keywords} onChange={(event) => updateSeo("keywords", event.target.value)} rows={3} className={inputClassName} />
            </Field>
            <Field label="Canonical URL">
              <input value={form.seo.canonicalUrl} onChange={(event) => updateSeo("canonicalUrl", event.target.value)} className={inputClassName} />
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="inline-flex items-center gap-3 text-sm text-zinc-900 dark:text-zinc-100">
                <input type="checkbox" checked={form.seo.noIndex} onChange={(event) => updateSeo("noIndex", event.target.checked)} />
                <span>Не индексировать</span>
              </label>
              <label className="inline-flex items-center gap-3 text-sm text-zinc-900 dark:text-zinc-100">
                <input type="checkbox" checked={form.seo.noFollow} onChange={(event) => updateSeo("noFollow", event.target.checked)} />
                <span>Не переходить по ссылкам</span>
              </label>
            </div>
          </div>
        </details>
        ) : null}

        {error ? <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">{error}</div> : null}
        {success ? <div className="border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200">{success}</div> : null}

        {selectedType === "homepage" ? (
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={saving || !form.documentId} onClick={() => void handleSave()} className="inline-flex items-center justify-center border border-black bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 hover:border-zinc-800 disabled:opacity-60 dark:border-white dark:bg-white dark:text-[#08110b] dark:hover:bg-zinc-200 dark:hover:border-zinc-200">
              {saving ? "Сохраняем…" : "Сохранить настройки"}
            </button>
            <div className="inline-flex items-center px-4 text-sm text-zinc-500 dark:text-zinc-400">
              Удаление и создание отдельных записей здесь недоступны.
            </div>
          </div>
        ) : null}

        {selectedType !== "homepage" ? (
          <div className="flex flex-wrap gap-3">
          <button type="button" disabled={saving} onClick={() => void handleSave()} className="inline-flex items-center justify-center border border-black bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 hover:border-zinc-800 disabled:opacity-60 dark:border-white dark:bg-white dark:text-[#08110b] dark:hover:bg-zinc-200 dark:hover:border-zinc-200">{saving ? "Сохраняем…" : form.documentId ? "Сохранить изменения" : "Создать материал"}</button>
          {form.documentId ? (
            <button type="button" disabled={saving} onClick={() => void handleDelete()} className="inline-flex items-center justify-center border border-red-200 px-5 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30">Удалить материал</button>
          ) : null}
        </div>
        ) : null}

        {activeMediaPanel ? (
          <>
            <div className="fixed inset-0 z-40 bg-black/40" onClick={closeMediaPanel} aria-hidden="true" />
            <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[720px] flex-col border-l border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#08110b]">
              <div className="flex items-start justify-between gap-4 border-b border-black/10 px-5 py-4 dark:border-white/10">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Медиабиблиотека</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    {activeMediaPanel.kind === "cover"
                      ? "Выбор обложки"
                      : activeMediaPanel.kind === "infographic-video"
                        ? "Выбор видео для карточки"
                        : activeMediaPanel.kind === "infographic-corner-icon"
                          ? "Выбор SVG-иконки для карточки"
                        : activeMediaPanel.kind === "infographic-image"
                          ? "Выбор изображения для карточки"
                          : "Выбор изображения для блока"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeMediaPanel}
                  aria-label="Закрыть медиабиблиотеку"
                  className="inline-flex h-10 w-10 items-center justify-center border border-black/10 text-zinc-700 transition-colors hover:bg-black/[0.03] hover:text-zinc-900 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/[0.04] dark:hover:text-white"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="overflow-y-auto px-5 py-5">
                <div className="mb-4">
                  <MediaSummaryCard
                    asset={activePanelAsset}
                    accept={activeMediaPanel.kind === "infographic-video" ? "video" : "image"}
                    emptyLabel={activeMediaPanel.kind === "cover"
                      ? "Обложка не выбрана"
                      : activeMediaPanel.kind === "infographic-video"
                        ? "Видео не выбрано"
                        : activeMediaPanel.kind === "infographic-corner-icon"
                          ? "SVG-иконка не выбрана"
                        : "Изображение не выбрано"}
                    onOpen={() => undefined}
                    onClear={() => selectAssetFromPanel(null)}
                    openLabel="Панель открыта"
                  />
                </div>
                <MediaPicker
                  assets={mediaAssets}
                  accept={activeMediaPanel.kind === "infographic-video" ? "video" : "image"}
                  selectedId={activePanelAsset?.id ?? null}
                  onSelect={selectAssetFromPanel}
                  onUpload={(event) => activeMediaPanel.kind === "cover"
                    ? void handleCoverUpload(event)
                    : activeMediaPanel.kind === "infographic-corner-icon" && typeof activeMediaPanel.cardIndex === "number"
                      ? void handleInfographicUpload(activeMediaPanel.cardIndex, "infographic-corner-icon", event)
                    : activeMediaPanel.kind === "infographic-image" && typeof activeMediaPanel.cardIndex === "number"
                      ? void handleInfographicUpload(activeMediaPanel.cardIndex, "infographic-image", event)
                      : activeMediaPanel.kind === "infographic-video" && typeof activeMediaPanel.cardIndex === "number"
                        ? void handleInfographicUpload(activeMediaPanel.cardIndex, "infographic-video", event)
                      : typeof activeMediaPanel.blockIndex === "number"
                        ? void handleBlockFiles(activeMediaPanel.blockIndex, event)
                        : undefined}
                  uploadLabel={activeMediaPanel.kind === "cover"
                    ? "Загрузите новую обложку или выберите файл из библиотеки ниже."
                    : activeMediaPanel.kind === "infographic-corner-icon"
                      ? "Загрузите SVG-иконку для карточки инфографики или выберите уже загруженный файл из библиотеки ниже."
                    : activeMediaPanel.kind === "infographic-image"
                      ? "Загрузите изображение для карточки инфографики или выберите уже загруженный файл из библиотеки ниже."
                      : activeMediaPanel.kind === "infographic-video"
                        ? "Загрузите видео для карточки инфографики или выберите уже загруженный файл из библиотеки ниже."
                        : "Загрузите изображение для блока или выберите уже загруженный файл из библиотеки ниже."}
                />
              </div>
            </aside>
          </>
        ) : null}
      </section>
    </div>
  );
}
