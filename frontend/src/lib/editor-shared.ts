export const EDITOR_CONTENT_TYPES = ["article", "news", "video", "gallery", "homepage"] as const;

export const EDITOR_BLOCK_TYPES = [
  "blocks.html-editor",
  "blocks.embed",
  "blocks.image-gallery",
  "blocks.image-slider",
  "blocks.image-highlight",
] as const;

export type EditorContentType = (typeof EDITOR_CONTENT_TYPES)[number];
export type EditorBlockType = (typeof EDITOR_BLOCK_TYPES)[number];

export type EditorHtmlEditorBlock = {
  __component: "blocks.html-editor";
  id?: number;
  title?: string | null;
  content: Record<string, unknown> | string;
};

export type EditorEmbedBlock = {
  __component: "blocks.embed";
  id?: number;
  title?: string | null;
  html: string;
};

export type EditorGalleryBlock = {
  __component: "blocks.image-gallery";
  id?: number;
  title?: string | null;
  description?: string | null;
  images: number[];
};

export type EditorSliderBlock = {
  __component: "blocks.image-slider";
  id?: number;
  title?: string | null;
  description?: string | null;
  photoSource?: string | null;
  images: number[];
};

export type EditorHighlightBlock = {
  __component: "blocks.image-highlight";
  id?: number;
  caption?: string | null;
  credit?: string | null;
  image: number | null;
};

export type EditorInfographicCard = {
  id?: number;
  shape?: "square" | "rectangle" | "circle" | null;
  title?: string | null;
  description?: string | null;
  href?: string | null;
  backgroundImage?: number | null;
  backgroundVideo?: number | null;
  cornerIcon?: number | null;
  accentText?: string | null;
  theme?: "light" | "dark" | null;
};

export type EditorInfographicVersion = "desktop" | "tablet" | "mobile";

export type EditorInfographicVersionCards = Record<EditorInfographicVersion, EditorInfographicCard[]>;

export type EditorBlock =
  | EditorHtmlEditorBlock
  | EditorEmbedBlock
  | EditorGalleryBlock
  | EditorSliderBlock
  | EditorHighlightBlock;

export type EditorEntrySummary = {
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  status: "draft" | "published";
  publishedAt?: string | null;
  updatedAt?: string | null;
  type: EditorContentType;
};

export type EditorEntryDetail = EditorEntrySummary & {
  cover?: number | null;
  coverSource?: string | null;
  blocks: EditorBlock[];
  infographicCards?: EditorInfographicCard[];
  infographicCardsDesktop?: EditorInfographicCard[];
  infographicCardsTablet?: EditorInfographicCard[];
  infographicCardsMobile?: EditorInfographicCard[];
  fields?: Record<string, unknown>;
};

export type EditorSeo = {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  noIndex: boolean;
  noFollow: boolean;
};

export type EditorAuthorOption = {
  id: number;
  name: string;
};

export type EditorTaxonomyOption = {
  id: number;
  name: string;
  slug?: string | null;
};

export type EditorSession = {
  authenticated: boolean;
  user: {
    id: number;
    username: string;
    email?: string | null;
    memberProfile?: {
      id: number;
      displayName?: string | null;
      accountType?: "editor" | "author" | "subscriber" | null;
      isApprovedAuthor?: boolean | null;
      author?: {
        id: number;
        name?: string | null;
        slug?: string | null;
      } | null;
    } | null;
  } | null;
  capabilities: {
    canUseEditor: boolean;
    canCreate: EditorContentType[];
    canEditAll: boolean;
  };
};

export function isEditorContentType(value: string): value is EditorContentType {
  return EDITOR_CONTENT_TYPES.includes(value as EditorContentType);
}

export function isEditorBlockType(value: string): value is EditorBlockType {
  return EDITOR_BLOCK_TYPES.includes(value as EditorBlockType);
}
