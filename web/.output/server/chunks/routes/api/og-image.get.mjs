import { c as defineEventHandler, g as getQuery, e as createError, f as setHeader } from '../../_/nitro.mjs';
import sharp from 'sharp';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const ALLOWED_HOSTS = /* @__PURE__ */ new Set([
  "localhost",
  "winemaking-today.ru"
]);
const ogImage_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const src = query.src;
  if (!src) {
    throw createError({ statusCode: 400, statusMessage: "missing src" });
  }
  let url;
  try {
    url = new URL(src);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "invalid src" });
  }
  if (!ALLOWED_HOSTS.has(url.hostname)) {
    throw createError({ statusCode: 403, statusMessage: "forbidden" });
  }
  const upstream = await fetch(src);
  if (!upstream.ok) {
    throw createError({ statusCode: 502, statusMessage: "upstream error" });
  }
  const input = Buffer.from(await upstream.arrayBuffer());
  const output = await sharp(input).resize(1200, 630, { fit: "cover", position: "centre" }).jpeg({ quality: 85 }).toBuffer();
  setHeader(event, "Content-Type", "image/jpeg");
  setHeader(event, "Cache-Control", "public, max-age=31536000, immutable");
  return output;
});

export { ogImage_get as default };
//# sourceMappingURL=og-image.get.mjs.map
