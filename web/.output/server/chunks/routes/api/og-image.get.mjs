import { c as defineEventHandler, g as getQuery, e as createError, u as useRuntimeConfig, f as setHeader } from '../../_/nitro.mjs';
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
  "winemaking-today.ru",
  "api"
]);
function addAllowedHost(host) {
  if (host) ALLOWED_HOSTS.add(host);
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const ogImage_get = defineEventHandler(async (event) => {
  var _a, _b;
  const query = getQuery(event);
  let src = query.src;
  if (!src) {
    throw createError({ statusCode: 400, statusMessage: "missing src" });
  }
  const config = useRuntimeConfig();
  const publicMediaBaseUrl = ((_a = config.public.mediaBaseUrl) == null ? void 0 : _a.replace(/\/$/, "")) || "";
  const internalApiBase = ((_b = config.apiUrl) == null ? void 0 : _b.replace(/\/api$/, "")) || "http://api:4000";
  if (publicMediaBaseUrl) {
    try {
      addAllowedHost(new URL(publicMediaBaseUrl).hostname);
    } catch {
    }
  }
  try {
    addAllowedHost(new URL(internalApiBase).hostname);
  } catch {
  }
  if (publicMediaBaseUrl && src.startsWith(publicMediaBaseUrl)) {
    src = src.replace(new RegExp("^" + escapeRegExp(publicMediaBaseUrl)), internalApiBase);
  }
  let url;
  try {
    url = new URL(src);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "invalid src" });
  }
  const isAllowedHost = ALLOWED_HOSTS.has(url.hostname) || src.startsWith(internalApiBase) || publicMediaBaseUrl && src.startsWith(publicMediaBaseUrl);
  if (!isAllowedHost) {
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
