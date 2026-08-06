// Публичные индексные и статические страницы + рубрики, авторы и теги.

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const urlEntry = (loc: string, lastmod?: string | null) =>
  `  <url>\n    <loc>${escapeXml(loc)}</loc>${
    lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''
  }\n  </url>`;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';
  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';

  const entries: string[] = [];
  const staticPages = [
    '/',
    '/articles',
    '/news',
    '/videos',
    '/gallery',
    '/authors',
    '/about',
    '/contacts',
    '/legal',
    '/privacy',
    '/editorial-policy',
    '/corrections-policy',
    '/winemakers',
    '/winemakers/persons',
    '/wines',
    '/regions',
    '/terroirs',
    '/wineries',
  ];

  for (const path of staticPages) {
    entries.push(urlEntry(`${siteUrl}${path}`));
  }

  try {
    const categories: any[] = await $fetch(`${apiUrl}/categories`);
    for (const category of categories || []) {
      if (!category?.slug) continue;
      entries.push(urlEntry(`${siteUrl}/category/${category.slug}`));
    }
  } catch {
    // ignore
  }

  try {
    const authors: any[] = await $fetch(`${apiUrl}/authors`);
    for (const author of authors || []) {
      if (!author?.slug) continue;
      entries.push(urlEntry(`${siteUrl}/author/${author.slug}`));
    }
  } catch {
    // ignore
  }

  try {
    const tags: any[] = await $fetch(`${apiUrl}/tags`);
    for (const tag of tags || []) {
      if (!tag?.slug) continue;
      entries.push(urlEntry(`${siteUrl}/tags/${tag.slug}`));
    }
  } catch {
    // ignore
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  setHeader(event, 'Content-Type', 'application/xml');
  return xml;
});
