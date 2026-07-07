import sharp from 'sharp';

const ALLOWED_HOSTS = new Set([
  'localhost',
  'winemaking-today.ru',
  'api',
]);

function addAllowedHost(host: string) {
  if (host) ALLOWED_HOSTS.add(host);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  let src = query.src as string;

  if (!src) {
    throw createError({ statusCode: 400, statusMessage: 'missing src' });
  }

  const config = useRuntimeConfig();
  const publicMediaBaseUrl = (config.public.mediaBaseUrl as string)?.replace(/\/$/, '') || '';
  const internalApiBase = (config.apiUrl as string)?.replace(/\/api$/, '') || 'http://api:4000';

  if (publicMediaBaseUrl) {
    try {
      addAllowedHost(new URL(publicMediaBaseUrl).hostname);
    } catch {
      // ignore invalid base URL
    }
  }
  try {
    addAllowedHost(new URL(internalApiBase).hostname);
  } catch {
    // ignore invalid base URL
  }

  // Rewrite public media URL to internal API origin so the Nuxt server can
  // fetch the file inside the Docker network.
  if (publicMediaBaseUrl && src.startsWith(publicMediaBaseUrl)) {
    src = src.replace(new RegExp('^' + escapeRegExp(publicMediaBaseUrl)), internalApiBase);
  }

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'invalid src' });
  }

  const isAllowedHost = ALLOWED_HOSTS.has(url.hostname) ||
    src.startsWith(internalApiBase) ||
    (publicMediaBaseUrl && src.startsWith(publicMediaBaseUrl));

  if (!isAllowedHost) {
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
