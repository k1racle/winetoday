import sharp from "sharp";

import { getAllowedOgImageHosts, resolveOgImageUpstreamUrl } from "@/lib/og-image";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const src = searchParams.get("src");

    if (!src) {
      return new Response("missing src", { status: 400 });
    }

    const upstreamUrl = resolveOgImageUpstreamUrl(src);
    const parsedUpstream = new URL(upstreamUrl);

    if (!getAllowedOgImageHosts().has(parsedUpstream.hostname)) {
      return new Response("forbidden", { status: 403 });
    }

    const upstream = await fetch(upstreamUrl);

    if (!upstream.ok) {
      return new Response("upstream error", { status: 502 });
    }

    const input = Buffer.from(await upstream.arrayBuffer());
    const output = await sharp(input)
      .resize(1200, 630, { fit: "cover", position: "centre" })
      .jpeg({ quality: 85 })
      .toBuffer();

    return new Response(new Uint8Array(output), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("convert error", { status: 500 });
  }
}
