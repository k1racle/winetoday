import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

const PREVIEW_PATH_COOKIE = "nvt-preview-path";

function getRequestOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const safeUrl = url && url.startsWith("/") ? url : "/";

  const draft = await draftMode();
  draft.disable();

  const response = NextResponse.redirect(new URL(safeUrl, getRequestOrigin(request)));
  response.cookies.delete(PREVIEW_PATH_COOKIE);

  return response;
}
