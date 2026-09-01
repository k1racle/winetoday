import { isTiptapJson, tiptapToHtml } from '~/utils/tiptap-html';

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

function decodeCodePoint(value: string, radix: number): string {
  const codePoint = Number.parseInt(value, radix);
  return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
    ? String.fromCodePoint(codePoint)
    : '';
}

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&#(\d+);/g, (_, code) => decodeCodePoint(code, 10))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => decodeCodePoint(code, 16))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#039;/gi, "'");

const htmlToText = (value: string) =>
  decodeHtmlEntities(
    value
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>|<\/h[1-6]>|<\/li>|<\/blockquote>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

function getFullText(item: any): string {
  const parts: string[] = [];

  for (const block of Array.isArray(item?.contentBlocks) ? item.contentBlocks : []) {
    if (['rich-text', 'html-editor', 'text'].includes(block?.type)) {
      const raw = block?.content;
      if (typeof raw !== 'string') continue;
      const html = isTiptapJson(raw) ? tiptapToHtml(raw) : raw;
      const text = htmlToText(html);
      if (text) parts.push(text);
    } else if (block?.type === 'quote' && block?.text) {
      parts.push([block.text, block.author, block.role].filter(Boolean).join(' — '));
    }
  }

  // На странице материал без текстовых блоков выводит excerpt как основной текст.
  return parts.join('\n\n').trim() || String(item?.excerpt || '').trim();
}

const getGenre = (type: string) => (type === 'news' ? 'message' : 'article');

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';
  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';
  // RSS доступен извне, поэтому ссылки на медиа должны использовать публичный хост.
  const mediaBaseUrl = (
    (config.public.mediaBaseUrl as string) || apiUrl.replace(/\/api$/, '')
  ).replace(/\/+$/, '');

  let items: any[] = [];
  try {
    const res: any = await $fetch(`${apiUrl}/content`, {
      // Берём запас, затем убираем влияние homepage pinning и сортируем сам фид по дате.
      query: { limit: 100 },
    });
    items = (res?.items || [])
      .sort(
        (left: any, right: any) =>
          new Date(right?.publishedAt || 0).getTime() - new Date(left?.publishedAt || 0).getTime(),
      )
      .slice(0, 50);
  } catch (cause) {
    throw createError({
      statusCode: 503,
      statusMessage: 'RSS source is temporarily unavailable',
      cause,
    });
  }

  const itemEntries: string[] = [];
  let itemEntriesBytes = 0;
  let latestPublishedAt = 0;
  for (const item of items) {
    const base = TYPE_TO_PATH[item?.type];
    if (!base || !item?.slug || !item?.title || !item?.publishedAt) continue;

    const link = `${siteUrl}${base}/${item.slug}`;
    const publishedAt = new Date(item.publishedAt);
    if (Number.isNaN(publishedAt.getTime())) continue;

    const pubDate = publishedAt.toUTCString();
    const fullText = getFullText(item);
    if (!fullText) continue;

    const category = item.categories?.[0]?.name;
    const coverPath: string | undefined = item.coverMedia?.path;
    const coverUrl = coverPath
      ? /^https?:\/\//.test(coverPath)
        ? coverPath
        : `${mediaBaseUrl}${coverPath}`
      : null;

    const entry =
      `  <item>\n` +
        `    <title>${escapeXml(item.title || '')}</title>\n` +
        `    <link>${escapeXml(link)}</link>\n` +
        `    <guid isPermaLink="true">${escapeXml(link)}</guid>\n` +
        `    <pubDate>${escapeXml(pubDate)}</pubDate>\n` +
        (item.excerpt ? `    <description>${escapeXml(item.excerpt)}</description>\n` : '') +
        (item.author?.name ? `    <author>${escapeXml(item.author.name)}</author>\n` : '') +
        (category ? `    <category>${escapeXml(category)}</category>\n` : '') +
        `    <yandex:genre>${getGenre(item.type)}</yandex:genre>\n` +
        `    <yandex:full-text>${escapeXml(fullText)}</yandex:full-text>\n` +
        (coverUrl
          ? `    <enclosure url="${escapeXml(coverUrl)}"${
              item.coverMedia?.mime ? ` type="${escapeXml(item.coverMedia.mime)}"` : ''
            }${
              item.coverMedia?.sizeBytes
                ? ` length="${escapeXml(String(item.coverMedia.sizeBytes))}"`
                : ''
            } />\n`
          : '') +
        `  </item>`;

    const entryBytes = Buffer.byteLength(entry, 'utf8');
    // Оставляем запас относительно лимита Яндекса в 10 МБ на channel и служебные теги.
    if (itemEntriesBytes + entryBytes > 9_500_000) break;

    itemEntries.push(entry);
    itemEntriesBytes += entryBytes;
    latestPublishedAt = Math.max(latestPublishedAt, publishedAt.getTime());
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:yandex="http://news.yandex.ru" version="2.0">
<channel>
  <title>ВИНОДЕЛИЕ СЕГОДНЯ</title>
  <link>${escapeXml(siteUrl || '/')}</link>
  <description>Федеральное отраслевое медиа о виноделии, виноградарстве и винной культуре в России и мире.</description>
  <language>ru</language>
${latestPublishedAt ? `  <lastBuildDate>${new Date(latestPublishedAt).toUTCString()}</lastBuildDate>\n` : ''}${itemEntries.join('\n')}
</channel>
</rss>`;

  setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8');
  setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=300');
  return xml;
});
