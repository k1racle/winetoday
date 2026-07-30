const TYPE_TO_PATH: Record<string, string> = {
  article: '/articles',
  news: '/news',
  video: '/videos',
  gallery: '/gallery',
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';
  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';
  // Аналог useMediaUrl: медиа отдаётся с хоста API без суффикса /api
  const mediaBaseUrl = apiUrl.replace(/\/api$/, '');

  let items: any[] = [];
  try {
    const res: any = await $fetch(`${apiUrl}/content`, {
      query: { limit: 50 },
    });
    items = res?.items || [];
  } catch {
    // API недоступно — отдаём пустой channel
  }

  const itemEntries: string[] = [];
  for (const item of items) {
    const base = TYPE_TO_PATH[item?.type];
    if (!base || !item?.slug) continue;

    const link = `${siteUrl}${base}/${item.slug}`;
    const pubDate = item.publishedAt ? new Date(item.publishedAt).toUTCString() : null;
    const category = item.categories?.[0]?.name;
    const coverPath: string | undefined = item.coverMedia?.path;
    const coverUrl = coverPath
      ? /^https?:\/\//.test(coverPath)
        ? coverPath
        : `${mediaBaseUrl}${coverPath}`
      : null;

    itemEntries.push(
      `  <item>\n` +
        `    <title>${escapeXml(item.title || '')}</title>\n` +
        `    <link>${escapeXml(link)}</link>\n` +
        `    <guid isPermaLink="true">${escapeXml(link)}</guid>\n` +
        (pubDate ? `    <pubDate>${escapeXml(pubDate)}</pubDate>\n` : '') +
        (item.excerpt ? `    <description>${escapeXml(item.excerpt)}</description>\n` : '') +
        (category ? `    <category>${escapeXml(category)}</category>\n` : '') +
        (coverUrl
          ? `    <enclosure url="${escapeXml(coverUrl)}"${
              item.coverMedia?.mime ? ` type="${escapeXml(item.coverMedia.mime)}"` : ''
            }${
              item.coverMedia?.sizeBytes
                ? ` length="${escapeXml(String(item.coverMedia.sizeBytes))}"`
                : ''
            } />\n`
          : '') +
        `  </item>`,
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>ВИНОДЕЛИЕ СЕГОДНЯ</title>
  <link>${escapeXml(siteUrl || '/')}</link>
  <description>Федеральное отраслевое медиа о виноделии, виноградарстве и винной культуре в России и мире.</description>
  <language>ru</language>
${itemEntries.join('\n')}
</channel>
</rss>`;

  setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8');
  return xml;
});
