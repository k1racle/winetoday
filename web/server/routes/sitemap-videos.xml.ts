import { ensureSitemapEnabled } from '~/server/utils/site-seo';
import { escapeXml, fetchPaginatedItems, SITEMAP_PAGE_SIZE, toIso, urlEntry } from '~/server/utils/sitemap';

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
  const items = await fetchPaginatedItems<any>(`${apiUrl}/content`, { type: 'video' }, SITEMAP_PAGE_SIZE);
  const entries = items
    .filter((item) => item?.slug)
    .map((item) =>
      urlEntry(
        `${siteUrl}/videos/${item.slug}`,
        toIso(item.updatedAt || item.publishedAt),
        videoEntry(item, mediaBaseUrl) || undefined,
      ),
    );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${entries.join('\n')}
</urlset>`;

  setHeader(event, 'Content-Type', 'application/xml');
  return xml;
});
