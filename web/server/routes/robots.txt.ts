import { getSiteSeoFlags } from '~/server/utils/site-seo';

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const siteUrl = `${(config.public.siteUrl as string)?.replace(/\/+$/, '')}`;
  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';
  const { robotsEnabled, sitemapEnabled } = await getSiteSeoFlags(apiUrl);
  const sitemap = `${siteUrl}/sitemap.xml`;

  if (robotsEnabled === false) {
    return [
      'User-agent: *',
      'Disallow: /',
    ].join('\n');
  }

  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    'Clean-param: utm_source&utm_medium&utm_campaign&utm_term&utm_content /',
  ];

  if (sitemapEnabled !== false) {
    lines.push('', `Sitemap: ${sitemap}`);
  }

  return lines.join('\n');
});
