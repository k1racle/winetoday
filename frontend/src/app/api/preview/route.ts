import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

const PREVIEW_SECRET = process.env.PREVIEW_SECRET;
const PREVIEW_PATH_COOKIE = "nvt-preview-path";

type PreviewType = "article" | "news" | "video" | "gallery";

function isPreviewType(value: string | null): value is PreviewType {
  return value === "article" || value === "news" || value === "video" || value === "gallery";
}

function getRequestOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

function buildPreviewPath(type: PreviewType, slug: string) {
  if (!slug || slug.includes("/")) {
    return null;
  }

  if (type === "article") {
    return `/articles/${slug}`;
  }

  if (type === "news") {
    return `/news/${slug}`;
  }

  if (type === "gallery") {
    return `/gallery/${slug}`;
  }

  return `/videos/${slug}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const url = searchParams.get("url");
  const path = searchParams.get("path");
  const type = searchParams.get("type");
  const slug = searchParams.get("slug")?.trim() || "";

  const previewPath = url?.startsWith("/")
    ? url
    : path?.startsWith("/")
      ? path
      : isPreviewType(type)
        ? buildPreviewPath(type, slug)
        : null;

  const hasInvalidSecret = Boolean(secret) && (!PREVIEW_SECRET || secret !== PREVIEW_SECRET);

  if (!previewPath || hasInvalidSecret) {
    return new Response("Недопустимый запрос предпросмотра", { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  const response = NextResponse.redirect(
    new URL(previewPath, getRequestOrigin(request)),
  );
  response.cookies.set(PREVIEW_PATH_COOKIE, previewPath, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
