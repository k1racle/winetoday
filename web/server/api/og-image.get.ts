import sharp from 'sharp';

const ALLOWED_HOSTS = new Set([
  'localhost',
  'winemaking-today.ru',
]);

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const src = query.src as string;

  if (!src) {
    throw createError({ statusCode: 400, statusMessage: 'missing src' });
  }

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'invalid src' });
  }

  if (!ALLOWED_HOSTS.has(url.hostname)) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }

  const upstream = await fetch(src);
  if (!upstream.ok) {
    throw createError({ statusCode: 502, statusMessage: 'upstream error' });
  }

  const input = Buffer.from(await upstream.arrayBuffer());
  const output = await sharp(input)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85 })
    .toBuffer();

  setHeader(event, 'Content-Type', 'image/jpeg');
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
  return output;
});
