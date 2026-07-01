export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const sitemap = `${config.public.siteUrl}/sitemap.xml`;

  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${sitemap}`,
  ].join('\n');
});
