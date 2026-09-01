const INDEX_NOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

export default defineEventHandler((event) => {
  const configuredKey = `${useRuntimeConfig(event).indexNowKey || ''}`.trim();
  const expectedPath = `/${configuredKey}.txt`;

  if (
    !INDEX_NOW_KEY_PATTERN.test(configuredKey) ||
    getRequestURL(event).pathname !== expectedPath
  ) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' });
  }

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  setHeader(event, 'Cache-Control', 'public, max-age=300');
  setHeader(event, 'X-Content-Type-Options', 'nosniff');
  setHeader(event, 'X-Robots-Tag', 'noindex');
  return configuredKey;
});
