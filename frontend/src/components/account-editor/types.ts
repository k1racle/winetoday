import { type ChangeEvent } from "react";
import { type EditorBlock, type EditorHtmlEditorBlock, type EditorEmbedBlock, type EditorGalleryBlock, type EditorSliderBlock, type EditorHighlightBlock, type EditorContentType, type EditorInfographicCard, type EditorInfographicVersion, type EditorSeo, type EditorSession, type EditorAuthorOption, type EditorTaxonomyOption, type EditorEntrySummary } from "@/lib/editor-shared";

export type EditorApiError = {
  error?: {
    message?: string;
  };
  message?: string;
};

export type EditorEntryPayload = EditorApiError & Record<string, unknown> & {
  documentId?: string;
};

export type UploadedAsset = {
  id: number;
  name?: string;
  url?: string;
  mime?: string;
  alternativeText?: string | null;
  previewUrl?: string | null;
};

export type SourceItem = {
  name: string;
  url: string;
};

export type UnknownRecord = Record<string, unknown>;

export type MaterialLabel = "none" | "exclusive" | "video";

export type FormState = {
  documentId: string | null;
  type: EditorContentType;
  title: string;
  slug: string;
  excerpt: string;
  materialLabel: MaterialLabel;
  cover: number | null;
  archiveCover: number | null;
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
  photos: number[];
  seo: EditorSeo;
  blocks: EditorBlock[];
};

export type ActiveMediaPanel = {
  kind: "cover" | "block-highlight" | "infographic-image" | "infographic-video" | "infographic-corner-icon";
  blockIndex?: number;
  cardIndex?: number;
} | null;

export type {
  EditorBlock,
  EditorHtmlEditorBlock,
  EditorEmbedBlock,
  EditorGalleryBlock,
  EditorSliderBlock,
  EditorHighlightBlock,
  EditorContentType,
  EditorInfographicCard,
  EditorInfographicVersion,
  EditorSeo,
  EditorSession,
  EditorAuthorOption,
  EditorTaxonomyOption,
  EditorEntrySummary,
  ChangeEvent,
};
