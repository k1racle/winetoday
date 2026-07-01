import { c as defineEventHandler, u as useRuntimeConfig } from '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const robots_txt = defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const sitemap = `${config.public.siteUrl}/sitemap.xml`;
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${sitemap}`
  ].join("\n");
});

export { robots_txt as default };
//# sourceMappingURL=robots.txt.mjs.map
