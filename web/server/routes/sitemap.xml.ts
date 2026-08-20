import { ensureSitemapEnabled } from '~/server/utils/site-seo';

const CHILD_SITEMAPS = [
  'sitemap-pages.xml',
  'sitemap-articles.xml',
  'sitemap-news.xml',
  'sitemap-google-news.xml',
  'sitemap-videos.xml',
  'sitemap-galleries.xml',
  'sitemap-winemakers.xml',
  'sitemap-wines.xml',
];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';
  if (!(await ensureSitemapEnabled(event, apiUrl))) {
    return '';
  }

  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';

  const entries = CHILD_SITEMAPS.map(
    (name) => `  <sitemap>\n    <loc>${escapeXml(`${siteUrl}/${name}`)}</loc>\n  </sitemap>`,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</sitemapindex>`;

  setHeader(event, 'Content-Type', 'application/xml');
  return xml;
});
