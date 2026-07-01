import { c as defineEventHandler, u as useRuntimeConfig, f as setHeader } from '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const sitemap_xml = defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const siteUrl = config.public.siteUrl;
  const urls = [
    "",
    "/articles",
    "/news",
    "/videos",
    "/gallery"
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(
    (path) => `  <url>
    <loc>${siteUrl}${path}</loc>
  </url>`
  ).join("\n")}
</urlset>`;
  setHeader(event, "Content-Type", "application/xml");
  return xml;
});

export { sitemap_xml as default };
//# sourceMappingURL=sitemap.xml.mjs.map
