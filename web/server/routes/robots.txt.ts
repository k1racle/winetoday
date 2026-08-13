export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const sitemap = `${(config.public.siteUrl as string)?.replace(/\/+$/, '')}/sitemap.xml`;

  return [
    'User-agent: *',
    'Allow: /',
    '',
    'Clean-param: utm_source&utm_medium&utm_campaign&utm_term&utm_content /',
    '',
    `Sitemap: ${sitemap}`,
  ].join('\n');
});
