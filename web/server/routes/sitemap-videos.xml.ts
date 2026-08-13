import { ensureSitemapEnabled } from '~/server/utils/site-seo';

const PAGE_SIZE = 100; // API ListContentDto limit max is 100

const TYPE_TO_PATH: Record<string, string> = {
  video: '/videos',
  gallery: '/gallery',
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const urlEntry = (loc: string, lastmod?: string | null, videoBlock?: string) =>
  `  <url>\n    <loc>${escapeXml(loc)}</loc>${
    lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''
  }${videoBlock ? `\n${videoBlock}` : ''}\n  </url>`;

const videoEntry = (item: any, mediaBaseUrl: string) => {
  if (!item?.slug) return null;

  const title = String(item.title || '').trim();
  if (!title) return null;

  const description = String(item.excerpt || item.title || '').trim();
  const thumbnailPath = item.coverMedia?.path;
  const thumbnailUrl = thumbnailPath
    ? /^https?:\/\//.test(thumbnailPath)
      ? thumbnailPath
      : `${mediaBaseUrl}${thumbnailPath}`
    : '';

  const playerUrl = String(item.videoUrl || '').trim();
  if (!thumbnailUrl || !playerUrl) return null;

  return [
    '    <video:video>',
    `      <video:title>${escapeXml(title)}</video:title>`,
    `      <video:description>${escapeXml(description)}</video:description>`,
    `      <video:thumbnail_loc>${escapeXml(thumbnailUrl)}</video:thumbnail_loc>`,
    `      <video:player_loc>${escapeXml(playerUrl)}</video:player_loc>`,
    item.publishedAt
      ? `      <video:publication_date>${escapeXml(new Date(item.publishedAt).toISOString())}</video:publication_date>`
      : '',
    '    </video:video>',
  ]
    .filter(Boolean)
    .join('\n');
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';
  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';
  if (!(await ensureSitemapEnabled(event, apiUrl))) {
    return '';
  }

  const mediaBaseUrl = ((config.public.mediaBaseUrl as string) || apiUrl.replace(/\/api$/, '')).replace(/\/+$/, '');
  const entries: string[] = [];

  for (const [type, base] of Object.entries(TYPE_TO_PATH)) {
    try {
      let offset = 0;
      let fetched = 0;
      do {
        const res: any = await $fetch(`${apiUrl}/content`, {
          query: { type, limit: PAGE_SIZE, offset },
        });
        const items: any[] = res?.items || [];
        for (const item of items) {
          if (!item?.slug) continue;
          const lastmod = item.publishedAt ? new Date(item.publishedAt).toISOString() : null;
          const loc = `${siteUrl}${base}/${item.slug}`;
          const videoBlock = type === 'video' ? videoEntry(item, mediaBaseUrl) : null;
          entries.push(urlEntry(loc, lastmod, videoBlock || undefined));
        }
        fetched = items.length;
        offset += PAGE_SIZE;
      } while (fetched === PAGE_SIZE);
    } catch {
      // ignore and move on to the next type
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${entries.join('\n')}
</urlset>`;

  setHeader(event, 'Content-Type', 'application/xml');
  return xml;
});
