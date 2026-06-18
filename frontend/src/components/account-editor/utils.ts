import { createEmptyTiptapDocument, parseTiptapDocument } from "@/lib/tiptap";
import { EDITOR_BLOCK_TYPES, isEditorContentType } from "@/lib/editor-shared";
import type { EditorBlock, EditorContentType, EditorInfographicCard, EditorInfographicVersion } from "@/lib/editor-shared";
import type { FormState, MaterialLabel, SourceItem, UnknownRecord, UploadedAsset } from "./types";

export { EDITOR_BLOCK_TYPES, isEditorContentType };

export const INFOGRAPHIC_VIEWPORTS: EditorInfographicVersion[] = ["desktop", "tablet", "mobile"];

export const INFOGRAPHIC_VIEWPORT_LABELS: Record<EditorInfographicVersion, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

export const INFOGRAPHIC_VIEWPORT_CARD_COUNTS: Record<EditorInfographicVersion, number> = {
  desktop: 8,
  tablet: 6,
  mobile: 7,
};

export const EMPTY_SEO = {
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  canonicalUrl: "",
  noIndex: false,
  noFollow: false,
};

export const EMPTY_RICH_BLOCK: Extract<EditorBlock, { __component: "blocks.html-editor" }> = {
  __component: "blocks.html-editor",
  title: "",
  content: createEmptyTiptapDocument(),
};

export const EMPTY_EMBED_BLOCK: Extract<EditorBlock, { __component: "blocks.embed" }> = {
  __component: "blocks.embed",
  title: "",
  html: "",
};

export function normalizeMaterialLabel(value: unknown): MaterialLabel {
  if (value === "exclusive" || value === "video") {
    return value;
  }

  return "none";
}

export function createEmptyInfographicCard(): EditorInfographicCard {
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

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

export function getRecordId(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id === "number") {
    return value.id;
  }

  if (typeof value.id === "string") {
    const parsed = Number(value.id);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

export function resolveRelationId(value: unknown): number | null {
  const recordId = getRecordId(value);

  if (recordId !== null) {
    return recordId;
  }

  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

export function normalizeRelationIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as number[];
  }

  return value
    .map((item) => resolveRelationId(item))
    .filter((item): item is number => item !== null);
}

export function normalizeEditorInfographicCards(cards: unknown, expectedCount: number): EditorInfographicCard[] {
  const normalized: EditorInfographicCard[] = Array.isArray(cards)
    ? cards.slice(0, expectedCount).map((card) => {
        const cardRecord = isRecord(card) ? card : {};
        const backgroundImageId = resolveRelationId(cardRecord.backgroundImage);
        const backgroundVideoId = resolveRelationId(cardRecord.backgroundVideo);
        const cornerIconId = resolveRelationId(cardRecord.cornerIcon);

        return {
          id: typeof cardRecord.id === "number" ? cardRecord.id : undefined,
          shape: cardRecord.shape === "rectangle" || cardRecord.shape === "circle" ? cardRecord.shape : "square",
          title: typeof cardRecord.title === "string" ? cardRecord.title : "",
          description: typeof cardRecord.description === "string" ? cardRecord.description : "",
          href: typeof cardRecord.href === "string" ? cardRecord.href : "",
          backgroundImage: backgroundImageId,
          backgroundVideo: backgroundVideoId,
          cornerIcon: cornerIconId,
          accentText: typeof cardRecord.accentText === "string" ? cardRecord.accentText : "",
          theme: cardRecord.theme === "dark" ? "dark" : "light",
        };
      })
    : [];

  while (normalized.length < expectedCount) {
    normalized.push(createEmptyInfographicCard());
  }

  return normalized;
}

export function createInitialState(type: EditorContentType, defaults: { author?: number | null } = {}): FormState {
  return {
    documentId: null,
    type,
    title: "",
    slug: "",
    excerpt: "",
    materialLabel: type === "video" ? "video" : "none",
    cover: null,
    archiveCover: null,
    coverSource: "",
    author: defaults.author ?? null,
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
    photos: [],
    seo: { ...EMPTY_SEO },
    blocks: type === "gallery" ? [] : [{ ...EMPTY_RICH_BLOCK }],
  };
}

export function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function getErrorMessage(payload: { error?: { message?: string }; message?: string } | null, fallback: string) {
  return payload?.error?.message || payload?.message || fallback;
}

export async function parseJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

export function blockLabel(type: EditorBlock["__component"]) {
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

export function blockBadgeClass(type: EditorBlock["__component"]) {
  switch (type) {
    case "blocks.html-editor":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "blocks.embed":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "blocks.image-gallery":
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300";
    case "blocks.image-slider":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    case "blocks.image-highlight":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

export function isMediaCollectionBlock(
  block: EditorBlock,
): block is Extract<EditorBlock, { __component: "blocks.image-gallery" | "blocks.image-slider" }> {
  return block.__component === "blocks.image-gallery" || block.__component === "blocks.image-slider";
}

export function legacyTextToTiptapDocument(value: string) {
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

function getTextFromLegacyChildren(value: unknown) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((child) => (isRecord(child) && typeof child.text === "string" ? child.text : ""))
    .join("");
}

function flattenLegacyNodes(nodes: unknown[]): string {
  return nodes
    .flatMap((node) => {
      if (!isRecord(node)) {
        return [];
      }

      if (node.type === "paragraph" && Array.isArray(node.children)) {
        return [getTextFromLegacyChildren(node.children)];
      }

      if (Array.isArray(node.children)) {
        return [getTextFromLegacyChildren(node.children)];
      }

      return [];
    })
    .filter(Boolean)
    .join("\n\n");
}

export function normalizeGalleryPhotoIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as number[];
  }

  return value
    .map((item) => Number(getRecordId(item) ?? item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

export function normalizeFormState(type: EditorContentType, entry: UnknownRecord): FormState {
  const state = createInitialState(type);
  const normalizedSources = Array.isArray(entry.sources)
    ? entry.sources
      .map((item) => {
        const source = isRecord(item) ? item : {};

        return {
          name: typeof source.name === "string" ? source.name : "",
          url: typeof source.url === "string" ? source.url : "",
        };
      })
      .filter((item: SourceItem) => item.name || item.url)
    : [];
  const cover = isRecord(entry.cover) ? entry.cover : null;
  const archiveCover = isRecord(entry.archiveCover) ? entry.archiveCover : null;
  const author = isRecord(entry.author) ? entry.author : null;
  const resolvedCoverId = resolveRelationId(entry.cover);
  const resolvedArchiveCoverId = resolveRelationId(entry.archiveCover);
  const resolvedAuthorId = resolveRelationId(entry.author);
  const seo = isRecord(entry.seo) ? entry.seo : null;
  const blocksSource = type === "homepage" ? entry.blocks : entry.content;

  return {
    ...state,
    documentId: typeof entry.documentId === "string" ? entry.documentId : null,
    title: typeof entry.title === "string" ? entry.title : "",
    slug: typeof entry.slug === "string" ? entry.slug : "",
    excerpt: typeof entry.excerpt === "string" ? entry.excerpt : "",
    materialLabel: normalizeMaterialLabel(entry.materialLabel),
    cover: getRecordId(cover) ?? resolvedCoverId,
    archiveCover: getRecordId(archiveCover) ?? resolvedArchiveCoverId,
    coverSource: typeof entry.coverSource === "string" ? entry.coverSource : "",
    author: getRecordId(author) ?? resolvedAuthorId,
    categories: normalizeRelationIds(entry.categories),
    tags: normalizeRelationIds(entry.tags),
    homepageSpecialBlock: entry.homepageSpecialBlock === true,
    status: entry.editorStatus === "published" || entry.publishedAt ? "published" : "draft",
    publishedAtCustom: toDateTimeLocalValue(typeof entry.publishedAtCustom === "string" ? entry.publishedAtCustom : null),
    readingTime: entry.readingTime ? String(entry.readingTime) : state.readingTime,
    sources: normalizedSources.length
      ? normalizedSources
      : entry.sourceName || entry.sourceUrl
        ? [{ name: typeof entry.sourceName === "string" ? entry.sourceName : "", url: typeof entry.sourceUrl === "string" ? entry.sourceUrl : "" }]
        : state.sources,
    startsAt: typeof entry.startsAt === "string" ? entry.startsAt.slice(0, 16) : "",
    endsAt: typeof entry.endsAt === "string" ? entry.endsAt.slice(0, 16) : "",
    locationName: typeof entry.locationName === "string" ? entry.locationName : "",
    city: typeof entry.city === "string" ? entry.city : "",
    address: typeof entry.address === "string" ? entry.address : "",
    ticketUrl: typeof entry.ticketUrl === "string" ? entry.ticketUrl : "",
    videoUrl: typeof entry.videoUrl === "string" ? entry.videoUrl : "",
    duration: entry.duration ? String(entry.duration) : state.duration,
    infographicTitle: typeof entry.infographicTitle === "string" ? entry.infographicTitle : "",
    infographicDescription: typeof entry.infographicDescription === "string" ? entry.infographicDescription : "",
    infographicCardsDesktop: normalizeEditorInfographicCards(entry.infographicCardsDesktop ?? entry.infographicCards, INFOGRAPHIC_VIEWPORT_CARD_COUNTS.desktop),
    infographicCardsTablet: normalizeEditorInfographicCards(entry.infographicCardsTablet ?? entry.infographicCards, INFOGRAPHIC_VIEWPORT_CARD_COUNTS.tablet),
    infographicCardsMobile: normalizeEditorInfographicCards(entry.infographicCardsMobile ?? entry.infographicCards, INFOGRAPHIC_VIEWPORT_CARD_COUNTS.mobile),
    photos: type === "gallery"
      ? normalizeGalleryPhotoIds(entry.photos)
      : state.photos,
    seo: {
      metaTitle: typeof seo?.metaTitle === "string" ? seo.metaTitle : "",
      metaDescription: typeof seo?.metaDescription === "string" ? seo.metaDescription : "",
      keywords: typeof seo?.keywords === "string" ? seo.keywords : "",
      canonicalUrl: typeof seo?.canonicalUrl === "string" ? seo.canonicalUrl : "",
      noIndex: seo?.noIndex === true,
      noFollow: seo?.noFollow === true,
    },
    blocks: type === "gallery"
      ? []
      : Array.isArray(blocksSource)
        ? blocksSource.map((blockValue) => {
          const block = isRecord(blockValue) ? blockValue : {};
          if (block.__component === "blocks.html-editor") {
            const content = typeof block.content === "string" || isRecord(block.content)
              ? block.content
              : null;

            return {
              __component: "blocks.html-editor" as const,
              title: typeof block.title === "string" ? block.title : "",
              content: parseTiptapDocument(content) ?? createEmptyTiptapDocument(),
            };
          }

          if (block.__component === "blocks.embed") {
            return {
              __component: "blocks.embed" as const,
              title: typeof block.title === "string" ? block.title : "",
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
              title: typeof block.title === "string" ? block.title : "",
              content,
            };
          }

          if (block.__component === "blocks.image-highlight") {
            return {
              __component: "blocks.image-highlight" as const,
              caption: typeof block.caption === "string" ? block.caption : "",
              credit: typeof block.credit === "string" ? block.credit : "",
              image: resolveRelationId(block.image),
            };
          }

          if (block.__component === "blocks.image-slider") {
            return {
              __component: "blocks.image-slider" as const,
              title: typeof block.title === "string" ? block.title : "",
              description: typeof block.description === "string" ? block.description : "",
              photoSource: typeof block.photoSource === "string" ? block.photoSource : "",
              images: normalizeRelationIds(block.images),
            };
          }

          return {
              __component: "blocks.image-gallery" as const,
              title: typeof block.title === "string" ? block.title : "",
              description: typeof block.description === "string" ? block.description : "",
              images: normalizeRelationIds(block.images),
            };
          })
        : state.blocks,
  };
}

export async function uploadFile(file: File) {
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

  const responsePayload = await parseJson<UploadedAsset[] | { error?: { message?: string }; message?: string }>(response);

  if (!response.ok || !Array.isArray(responsePayload) || !responsePayload[0]?.id) {
    throw new Error(getErrorMessage(responsePayload as { error?: { message?: string }; message?: string } | null, "Не удалось загрузить файл."));
  }

  return responsePayload[0].id;
}

export async function refreshMediaAssets(extraIds?: number[]) {
  const query = extraIds?.length ? `?ids=${extraIds.join(",")}` : "";
  const mediaResponse = await fetch(`/api/editor/media${query}`, { cache: "no-store" });
  const mediaPayload = await parseJson<UploadedAsset[] | { error?: { message?: string }; message?: string }>(mediaResponse);

  if (!mediaResponse.ok || !Array.isArray(mediaPayload)) {
    return null;
  }

  return mediaPayload;
}

export function filterAssetsByAccept(assets: UploadedAsset[], accept: "image" | "video") {
  return assets.filter((asset) => accept === "image"
    ? asset.mime?.startsWith("image/")
    : asset.mime?.startsWith("video/"));
}

export function mergeMediaAssets(current: UploadedAsset[], incoming: UploadedAsset[]): UploadedAsset[] {
  const incomingIds = new Set(incoming.map((asset) => asset.id));
  const merged = [...incoming];

  for (const asset of current) {
    if (!incomingIds.has(asset.id)) {
      merged.push(asset);
    }
  }

  return merged;
}

export function collectFormMediaIds(form: FormState): number[] {
  const ids = new Set<number>();

  if (form.cover !== null) ids.add(form.cover);
  if (form.archiveCover !== null) ids.add(form.archiveCover);

  for (const photoId of form.photos) {
    ids.add(photoId);
  }

  for (const block of form.blocks) {
    if (block.__component === "blocks.image-highlight" && block.image !== null) {
      ids.add(block.image);
    } else if (block.__component === "blocks.image-gallery" || block.__component === "blocks.image-slider") {
      for (const imageId of block.images) {
        ids.add(imageId);
      }
    }
  }

  return [...ids];
}

export function findAssetById(assets: UploadedAsset[], selectedId: number | null, accept?: "image" | "video") {
  if (selectedId === null) {
    return null;
  }

  const source = accept ? filterAssetsByAccept(assets, accept) : assets;
  return source.find((asset) => asset.id === selectedId) ?? null;
}

export function sortEditorTypes(types: EditorContentType[]) {
  const order: EditorContentType[] = ["article", "news", "video", "gallery", "homepage"];
  return types.slice().sort((left, right) => order.indexOf(left) - order.indexOf(right));
}

export function publicPath(type: EditorContentType, slug: string) {
  if (!slug.trim()) {
    return type === "homepage" ? "/" : null;
  }

  return type === "article"
    ? `/articles/${slug}`
    : type === "news"
      ? `/news/${slug}`
      : type === "video"
        ? `/videos/${slug}`
        : type === "gallery"
          ? `/gallery/${slug}`
          : null;
}

export function formatDateTimeLabel(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function timeAgoLabel(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) {
    return "только что";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} мин назад`;
  }

  if (diffHours < 24) {
    return `${diffHours} ч назад`;
  }

  if (diffDays === 1) {
    return "вчера";
  }

  if (diffDays < 7) {
    return `${diffDays} дня назад`;
  }

  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(date);
}
