import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

const PREVIEW_PATH_COOKIE = "nvt-preview-path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const safeUrl = url && url.startsWith("/") ? url : "/";

  const draft = await draftMode();
  draft.disable();

  const response = NextResponse.redirect(new URL(safeUrl, request.url));
  response.cookies.delete(PREVIEW_PATH_COOKIE);

  return response;
}
