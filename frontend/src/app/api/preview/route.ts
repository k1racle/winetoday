import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

const PREVIEW_SECRET = process.env.PREVIEW_SECRET;
const PREVIEW_PATH_COOKIE = "nvt-preview-path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const url = searchParams.get("url");

  if (!PREVIEW_SECRET || secret !== PREVIEW_SECRET || !url || !url.startsWith("/")) {
    return new Response("Недопустимый запрос предпросмотра", { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  const response = NextResponse.redirect(new URL(url, request.url));
  response.cookies.set(PREVIEW_PATH_COOKIE, url, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
