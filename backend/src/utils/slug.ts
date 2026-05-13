import type { Core } from '@strapi/strapi';

const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'cz',
  ч: 'ch',
  ш: 'sh',
  щ: 'shh',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

const AUTO_SLUG_UIDS = new Set([
  'api::article.article',
  'api::news.news',
  'api::video.video',
  'api::gallery.gallery',
  'api::page.page',
  'api::category.category',
  'api::tag.tag',
  'api::author.author',
  'api::sidebar.sidebar',
]);

const AUTO_SLUG_SOURCE_FIELDS: Record<string, string> = {
  'api::article.article': 'title',
  'api::news.news': 'title',
  'api::video.video': 'title',
  'api::gallery.gallery': 'title',
  'api::page.page': 'title',
  'api::category.category': 'name',
  'api::tag.tag': 'name',
  'api::author.author': 'name',
  'api::sidebar.sidebar': 'title',
};

export function transliterateToSlug(value: string) {
  const transliterated = value
    .trim()
    .toLowerCase()
    .split('')
    .map((character) => CYRILLIC_TO_LATIN_MAP[character] ?? character)
    .join('');

  const normalized = transliterated
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return normalized || 'entry';
}

async function findExistingSlugOwner(
  strapi: Core.Strapi,
  uid: string,
  slug: string,
  currentDocumentId?: string | null,
) {
  const existing = await strapi.documents(uid as any).findMany({
    filters: { slug },
    status: 'draft',
  } as any);

  const matchingDraft = existing.find((entry: any) => {
    if (!entry) {
      return false;
    }

    if (currentDocumentId && entry.documentId === currentDocumentId) {
      return false;
    }

    return true;
  });

  if (!matchingDraft) {
    return null;
  }

  return matchingDraft;
}

async function findEntryByDocumentId(strapi: Core.Strapi, uid: string, documentId?: string | null) {
  if (!documentId) {
    return null;
  }

  return strapi.documents(uid as any).findFirst({
    filters: { documentId },
  } as any);
}

async function findEntryById(strapi: Core.Strapi, uid: string, id?: number | null) {
  if (!id || !Number.isInteger(id)) {
    return null;
  }

  return strapi.db.query(uid).findOne({
    where: { id },
    select: ['documentId', 'slug'],
  });
}

export async function ensureUniqueSlug(
  strapi: Core.Strapi,
  uid: string,
  baseSlug: string,
  currentDocumentId?: string | null,
) {
  let attempt = 0;
  let candidate = baseSlug;

  while (await findExistingSlugOwner(strapi, uid, candidate, currentDocumentId)) {
    attempt += 1;
    candidate = `${baseSlug}-${attempt + 1}`;
  }

  return candidate;
}

function extractDocumentId(where: unknown) {
  if (!where || typeof where !== 'object') {
    return null;
  }

  const maybeWhere = where as { documentId?: unknown };
  return typeof maybeWhere.documentId === 'string' ? maybeWhere.documentId : null;
}

function extractId(where: unknown) {
  if (!where || typeof where !== 'object') {
    return null;
  }

  const maybeWhere = where as { id?: unknown };
  return typeof maybeWhere.id === 'number' && Number.isInteger(maybeWhere.id) ? maybeWhere.id : null;
}

function extractCurrentDocumentId(params: { documentId?: unknown; where?: unknown; data?: unknown } | undefined) {
  if (!params || typeof params !== 'object') {
    return null;
  }

  if (typeof params.documentId === 'string' && params.documentId.trim()) {
    return params.documentId.trim();
  }

  if (params.data && typeof params.data === 'object') {
    const maybeData = params.data as { documentId?: unknown };

    if (typeof maybeData.documentId === 'string' && maybeData.documentId.trim()) {
      return maybeData.documentId.trim();
    }
  }

  return extractDocumentId(params.where);
}

function extractCurrentEntityId(params: { where?: unknown; data?: unknown } | undefined) {
  if (!params || typeof params !== 'object') {
    return null;
  }

  const whereId = extractId(params.where);

  if (whereId) {
    return whereId;
  }

  if (!params.data || typeof params.data !== 'object') {
    return null;
  }

  const maybeData = params.data as { id?: unknown };
  return typeof maybeData.id === 'number' && Number.isInteger(maybeData.id) ? maybeData.id : null;
}

async function findExistingEntryForUpdate(
  strapi: Core.Strapi,
  uid: string,
  params: { documentId?: unknown; where?: unknown; data?: unknown } | undefined,
) {
  const currentDocumentId = extractCurrentDocumentId(params);

  if (currentDocumentId) {
    const entryByDocumentId = await findEntryByDocumentId(strapi, uid, currentDocumentId);

    if (entryByDocumentId) {
      return entryByDocumentId;
    }
  }

  const currentEntityId = extractCurrentEntityId(params);

  if (!currentEntityId) {
    return null;
  }

  return findEntryById(strapi, uid, currentEntityId);
}

export async function applyAutoSlug(event: any) {
  const uid = event.model?.uid as string | undefined;

  if (!uid || !AUTO_SLUG_UIDS.has(uid)) {
    return;
  }

  const data = event.params?.data as Record<string, unknown> | undefined;

  if (!data) {
    return;
  }

  const hasSlugInPayload = Object.prototype.hasOwnProperty.call(data, 'slug');
  const rawSlug = typeof data.slug === 'string' ? data.slug.trim() : null;
  const sourceField = AUTO_SLUG_SOURCE_FIELDS[uid];
  const sourceValue = data[sourceField];
  const rawSourceValue = typeof sourceValue === 'string' ? sourceValue.trim() : '';
  const operation = event.state?.autoSlugOperation;
  const isCreateAction = operation === 'create';

  if (!isCreateAction) {
    if (Object.prototype.hasOwnProperty.call(data, 'slug')) {
      delete data.slug;
    }

    return;
  }

  const currentDocumentId = extractCurrentDocumentId(event.params);
  const existingEntry = await findEntryByDocumentId(event.state.strapi, uid, currentDocumentId);
  const existingSlug = typeof existingEntry?.slug === 'string' ? existingEntry.slug.trim() : '';
  const resolvedDocumentId =
    currentDocumentId || (typeof existingEntry?.documentId === 'string' ? existingEntry.documentId.trim() : null);

  if (existingSlug) {
    data.slug = existingSlug;
    return;
  }

  if (!hasSlugInPayload && !rawSourceValue) {
    return;
  }

  const slugSource = rawSlug || rawSourceValue;

  if (!slugSource) {
    return;
  }

  const normalizedSlug = transliterateToSlug(slugSource);

  data.slug = await ensureUniqueSlug(event.state.strapi, uid, normalizedSlug, resolvedDocumentId);
}
