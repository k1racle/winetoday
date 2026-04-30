import {
  EDITOR_BLOCK_TYPES,
  EDITOR_CONTENT_TYPES,
  type EditorBlock,
  type EditorContentType,
  type EditorEntryDetail,
  type EditorEntrySummary,
  type EditorSession,
  isEditorBlockType,
  isEditorContentType,
} from "@/lib/editor-shared";
import { getAuthToken } from "@/lib/auth";
import { CMS_API_URL } from "@/lib/strapi";

const TYPE_TO_ENDPOINT: Record<EditorContentType, string> = {
  article: "/api/articles",
  news: "/api/news-entries",
  video: "/api/videos",
  homepage: "/api/homepage",
};

export {
  EDITOR_BLOCK_TYPES,
  EDITOR_CONTENT_TYPES,
  isEditorBlockType,
  isEditorContentType,
};
export type { EditorBlock, EditorContentType, EditorEntryDetail, EditorEntrySummary, EditorSession };

export async function cmsFetch(path: string, init?: RequestInit) {
  const token = await getAuthToken();

  const headers = new Headers(init?.headers ?? undefined);

  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (init?.body instanceof FormData) {
    headers.delete("Content-Type");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(new URL(path, CMS_API_URL), {
    ...init,
    headers,
    cache: "no-store",
  });
}

export function endpointForType(type: EditorContentType) {
  return TYPE_TO_ENDPOINT[type];
}

export function buildEditorQuery(type: EditorContentType, documentId?: string) {
  const base = endpointForType(type);

  if (!documentId) {
    return `${base}?pagination[limit]=100&sort[0]=updatedAt:desc&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=updatedAt&fields[4]=publishedAt&fields[5]=documentId&fields[6]=status`;
  }

  return `${base}?filters[documentId][$eq]=${encodeURIComponent(documentId)}&populate[cover]=true&populate[content][populate]=*`;
}
