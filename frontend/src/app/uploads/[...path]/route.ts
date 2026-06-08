import { CMS_API_URL } from "@/lib/strapi";

export const runtime = "nodejs";

function buildUpstreamUrl(pathSegments: string[], requestUrl: string) {
  const upstream = new URL(`${CMS_API_URL.replace(/\/+$/, "")}/uploads/${pathSegments.join("/")}`);
  const incoming = new URL(requestUrl);

  if (incoming.search) {
    upstream.search = incoming.search;
  }

  return upstream;
}

function buildProxyHeaders(request: Request, upstreamResponse: Response) {
  const headers = new Headers();

  const passthrough = ["content-type", "content-length", "content-range", "etag", "last-modified"];
  for (const name of passthrough) {
    const value = upstreamResponse.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  headers.set("accept-ranges", upstreamResponse.headers.get("accept-ranges") ?? "bytes");
  headers.set("cache-control", upstreamResponse.headers.get("cache-control") ?? "public, max-age=31536000, immutable");

  const origin = request.headers.get("origin");
  if (origin) {
    headers.set("access-control-allow-origin", origin);
    headers.set("vary", "Origin");
  }

  return headers;
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;

  if (!path?.length) {
    return new Response("Not found", { status: 404 });
  }

  const upstreamUrl = buildUpstreamUrl(path, request.url);
  const forwardHeaders = new Headers();

  const range = request.headers.get("range");
  if (range) {
    forwardHeaders.set("Range", range);
  }

  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch) {
    forwardHeaders.set("If-None-Match", ifNoneMatch);
  }

  const ifModifiedSince = request.headers.get("if-modified-since");
  if (ifModifiedSince) {
    forwardHeaders.set("If-Modified-Since", ifModifiedSince);
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(upstreamUrl, {
      headers: forwardHeaders,
      cache: "no-store",
    });
  } catch {
    return new Response("Upstream media unavailable", { status: 502 });
  }

  if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
    return new Response(upstreamResponse.statusText || "Not found", { status: upstreamResponse.status });
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: buildProxyHeaders(request, upstreamResponse),
  });
}

export async function HEAD(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;

  if (!path?.length) {
    return new Response(null, { status: 404 });
  }

  const upstreamUrl = buildUpstreamUrl(path, request.url);

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(upstreamUrl, { method: "HEAD", cache: "no-store" });
  } catch {
    return new Response(null, { status: 502 });
  }

  return new Response(null, {
    status: upstreamResponse.status,
    headers: buildProxyHeaders(request, upstreamResponse),
  });
}
