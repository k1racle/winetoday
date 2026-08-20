import sharp from 'sharp';

const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8_000;

function parseHttpUrl(value: string, statusCode = 500): URL {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
      throw new Error('unsupported URL');
    }
    return url;
  } catch {
    throw createError({ statusCode, statusMessage: 'invalid URL' });
  }
}

function isWithinBase(url: URL, base: URL): boolean {
  if (url.origin !== base.origin) return false;
  const basePath = base.pathname.replace(/\/+$/, '') || '/';
  return basePath === '/' || url.pathname === basePath || url.pathname.startsWith(`${basePath}/`);
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const src = query.src;

  if (typeof src !== 'string' || !src) {
    throw createError({ statusCode: 400, statusMessage: 'missing src' });
  }

  const config = useRuntimeConfig();
  const publicMediaBaseUrl = (config.public.mediaBaseUrl as string)?.replace(/\/$/, '') || '';
  const internalApiBase = (config.apiUrl as string)?.replace(/\/api$/, '') || 'http://api:4000';

  const publicMediaBase = publicMediaBaseUrl
    ? parseHttpUrl(publicMediaBaseUrl)
    : null;
  const internalApi = parseHttpUrl(internalApiBase);
  const sourceUrl = parseHttpUrl(src, 400);

  // Rewrite public media URL to internal API origin so the Nuxt server can
  // fetch the file inside the Docker network.
  let upstreamUrl = sourceUrl;
  if (publicMediaBase && isWithinBase(sourceUrl, publicMediaBase)) {
    upstreamUrl = new URL(`${sourceUrl.pathname}${sourceUrl.search}`, internalApi);
  } else if (!isWithinBase(sourceUrl, internalApi)) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }

  const upstream = await fetch(upstreamUrl, {
    redirect: 'manual',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!upstream.ok) {
    throw createError({ statusCode: 502, statusMessage: 'upstream error' });
  }

  const contentType = upstream.headers.get('content-type') || '';
  const contentLength = Number(upstream.headers.get('content-length') || 0);
  if (!contentType.toLowerCase().startsWith('image/')) {
    throw createError({ statusCode: 415, statusMessage: 'source is not an image' });
  }
  if (contentLength > MAX_SOURCE_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'source image is too large' });
  }

  const input = Buffer.from(await upstream.arrayBuffer());
  if (input.byteLength > MAX_SOURCE_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'source image is too large' });
  }

  const output = await sharp(input, { failOn: 'error', limitInputPixels: 40_000_000 })
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85 })
    .toBuffer();

  setHeader(event, 'Content-Type', 'image/jpeg');
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
  return output;
});
