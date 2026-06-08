import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { resolveUsersPermissionsUser, resolveUsersPermissionsUserFromCookie } from '../../../utils/auth';

const { ForbiddenError, NotFoundError, ValidationError } = errors;

const TYPE_CONFIG = {
  article: {
    uid: 'api::article.article',
    summaryFields: ['title', 'slug', 'excerpt', 'documentId', 'updatedAt', 'publishedAt', 'views'],
  },
  news: {
    uid: 'api::news.news',
    summaryFields: ['title', 'slug', 'excerpt', 'documentId', 'updatedAt', 'publishedAt', 'views'],
  },
  video: {
    uid: 'api::video.video',
    summaryFields: ['title', 'slug', 'excerpt', 'documentId', 'updatedAt', 'publishedAt', 'views'],
  },
  gallery: {
    uid: 'api::gallery.gallery',
    summaryFields: ['title', 'slug', 'excerpt', 'documentId', 'updatedAt', 'publishedAt', 'views'],
  },
  homepage: {
    uid: 'api::homepage.homepage',
    summaryFields: ['title', 'documentId', 'updatedAt', 'publishedAt'],
  },
} as const;

const AUTHOR_STATS_TYPES = {
  article: {
    uid: TYPE_CONFIG.article.uid,
    label: 'Статья',
    labelEn: 'Article',
    path: '/articles',
  },
  news: {
    uid: TYPE_CONFIG.news.uid,
    label: 'Новость',
    labelEn: 'News',
    path: '/news',
  },
  video: {
    uid: TYPE_CONFIG.video.uid,
    label: 'Видео',
    labelEn: 'Video',
    path: '/videos',
  },
  gallery: {
    uid: TYPE_CONFIG.gallery.uid,
    label: 'Галерея',
    labelEn: 'Gallery',
    path: '/gallery',
  },
} as const;

type AuthorStatsType = keyof typeof AUTHOR_STATS_TYPES;

const VIEWS_STATS_TYPES = {
  article: AUTHOR_STATS_TYPES.article,
  news: AUTHOR_STATS_TYPES.news,
  video: AUTHOR_STATS_TYPES.video,
} as const;

type ViewsStatsType = keyof typeof VIEWS_STATS_TYPES;

const ALLOWED_BLOCKS = new Set([
  'blocks.html-editor',
  'blocks.embed',
  'blocks.image-gallery',
  'blocks.image-slider',
  'blocks.image-highlight',
]);

type EditorType = keyof typeof TYPE_CONFIG;

function isEditorType(value: string): value is EditorType {
  return value in TYPE_CONFIG;
}

function isAuthorStatsType(value: string): value is AuthorStatsType {
  return value in AUTHOR_STATS_TYPES;
}

function buildEditorPopulate(type: EditorType) {
  if (type === 'homepage') {
    return {
      infographicCards: {
        populate: {
          backgroundImage: true,
          backgroundVideo: true,
          cornerIcon: true,
        },
      },
      infographicCardsDesktop: {
        populate: {
          backgroundImage: true,
          backgroundVideo: true,
          cornerIcon: true,
        },
      },
      infographicCardsTablet: {
        populate: {
          backgroundImage: true,
          backgroundVideo: true,
          cornerIcon: true,
        },
      },
      infographicCardsMobile: {
        populate: {
          backgroundImage: true,
          backgroundVideo: true,
          cornerIcon: true,
        },
      },
      blocks: { populate: '*' },
      seo: true,
    };
  }

  if (type === 'gallery') {
    return {
      cover: true,
      photos: true,
      author: true,
      memberProfile: true,
      categories: true,
      seo: true,
    };
  }

  return {
    cover: true,
    content: { populate: '*' },
    author: true,
    categories: true,
    tags: true,
    ...(type === 'article' || type === 'news' ? { sources: true } : {}),
    seo: true,
  };
}

function runtimeHasAttribute(strapi: any, type: EditorType, attributeName: string) {
  const uid = TYPE_CONFIG[type].uid;
  const attributes = strapi.contentTypes?.[uid]?.attributes;

  return Boolean(attributes && Object.prototype.hasOwnProperty.call(attributes, attributeName));
}

function sanitizeEditorDataForRuntime(strapi: any, type: EditorType, data: Record<string, unknown>) {
  if (type === 'homepage') {
    return data;
  }

  const runtimeAttributes = strapi.contentTypes?.[TYPE_CONFIG[type].uid]?.attributes;

  if (!runtimeAttributes) {
    return data;
  }

  for (const key of Object.keys(data)) {
    if (!Object.prototype.hasOwnProperty.call(runtimeAttributes, key)) {
      strapi.log.warn(
        `[editor.save] Runtime schema for ${TYPE_CONFIG[type].uid} does not contain ${key}; dropping field before save.`,
      );
      delete data[key];
    }
  }

  return data;
}

function createEmptyTiptapDocument() {
  return {
    type: 'doc',
    content: [{ type: 'paragraph' }],
  };
}

function createParagraphTiptapDocument(text: string) {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }],
      },
    ],
  };
}

function serializeHtmlEditorContent(rawContent: unknown) {
  if (typeof rawContent === 'string') {
    const trimmed = rawContent.trim();

    if (!trimmed) {
      throw new ValidationError('Текстовый блок должен содержать текст.');
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (parsed && typeof parsed === 'object') {
        return JSON.stringify(parsed);
      }
    } catch {
      return JSON.stringify(createParagraphTiptapDocument(trimmed));
    }

    return JSON.stringify(createParagraphTiptapDocument(trimmed));
  }

  if (rawContent && typeof rawContent === 'object') {
    return JSON.stringify(rawContent);
  }
 
  return JSON.stringify(createEmptyTiptapDocument());
}

function normalizeEmbedHtml(rawValue: unknown) {
  if (typeof rawValue !== 'string') {
    return '';
  }

  return rawValue.trim();
}

function normalizeRequestFiles(files: unknown): any[] {
  if (!files) {
    return [];
  }

  if (Array.isArray(files)) {
    return files.filter(Boolean);
  }

  if (typeof files === 'object') {
    return Object.values(files as Record<string, unknown>).flatMap((value) => normalizeRequestFiles(value));
  }

  return [];
}

function normalizeBase64Payload(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const dataUrlMatch = /^data:([^;,]+)?;base64,(.+)$/i.exec(trimmed);

  if (dataUrlMatch) {
    return {
      mimeType: dataUrlMatch[1] || undefined,
      base64: dataUrlMatch[2],
    };
  }

  return {
    mimeType: undefined,
    base64: trimmed,
  };
}

async function createUploadFileFromBase64(body: Record<string, any>) {
  const normalized = normalizeBase64Payload(body.contentBase64 ?? body.fileBase64 ?? body.dataUrl ?? null);

  if (!normalized?.base64) {
    return null;
  }

  const fileName = typeof body.fileName === 'string' && body.fileName.trim() ? body.fileName.trim() : 'upload.bin';
  const mimeType = typeof body.mimeType === 'string' && body.mimeType.trim()
    ? body.mimeType.trim()
    : (normalized.mimeType ?? 'application/octet-stream');
  const buffer = Buffer.from(normalized.base64, 'base64');
  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'editor-upload-'));
  const tempFilePath = path.join(tempDirectory, fileName);

  await fs.writeFile(tempFilePath, buffer);

  return {
    cleanupDirectory: tempDirectory,
    file: {
      filepath: tempFilePath,
      originalFilename: fileName,
      mimetype: mimeType,
      size: buffer.byteLength,
    },
  };
}

function resolveAssetPreviewUrl(asset: Record<string, any>) {
  if (typeof asset.previewUrl === 'string' && asset.previewUrl.trim()) {
    return asset.previewUrl;
  }

  return asset.formats?.thumbnail?.url ?? asset.formats?.small?.url ?? asset.url ?? null;
}

function serializeUploadedAsset(asset: Record<string, any>) {
  return {
    id: asset.id,
    name: asset.name ?? null,
    url: asset.url ?? null,
    mime: asset.mime ?? null,
    alternativeText: asset.alternativeText ?? null,
    previewUrl: resolveAssetPreviewUrl(asset),
  };
}

async function getMemberProfile(strapi: any, userId: number) {
  let profile = await strapi.db.query('api::member-profile.member-profile').findOne({
    where: { user: userId },
    populate: {
      author: true,
    },
  });

  if (!profile) {
    profile = await strapi.db.query('api::member-profile.member-profile').create({
      data: {
        user: userId,
        accountType: 'subscriber',
      },
      populate: {
        author: true,
      },
    });
  }

  return profile;
}

function profileAuthorName(profile: any) {
  const displayName = typeof profile?.displayName === 'string' ? profile.displayName.trim() : '';
  return displayName;
}

async function syncProfileAuthor(strapi: any, profile: any, author: any) {
  if (!profile?.id || !author?.id) {
    return;
  }

  const nextSlug = typeof author.slug === 'string' ? author.slug.trim() : '';

  const needsProfileUpdate = profile.author?.id !== author.id || (nextSlug && profile.authorSlug !== nextSlug);

  if (!needsProfileUpdate) {
    profile.author = author;
    if (nextSlug) {
      profile.authorSlug = nextSlug;
    }
    return;
  }

  await strapi.db.query('api::member-profile.member-profile').update({
    where: { id: profile.id },
    data: {
      author: author.id,
      authorSlug: nextSlug || profile.authorSlug || null,
    },
  });

  profile.author = author;
  if (nextSlug) {
    profile.authorSlug = nextSlug;
  }
}

async function ensureAuthorEntryForProfile(strapi: any, profile: any) {
  const name = profileAuthorName(profile);

  if (!profile?.id || !name) {
    return null;
  }

  if (profile.author?.id) {
    const existingByRelation = await strapi.documents('api::author.author' as any).findFirst({
      filters: { documentId: profile.author.documentId ?? undefined, id: profile.author.id },
      fields: ['name', 'slug'],
      populate: {
        memberProfile: true,
      },
    } as any).catch(() => null);

    if (existingByRelation) {
      await syncProfileAuthor(strapi, profile, existingByRelation);
      return existingByRelation;
    }
  }

  const authorSlug = typeof profile.authorSlug === 'string' ? profile.authorSlug.trim() : '';

  if (authorSlug) {
    const existingBySlug = await strapi.documents('api::author.author' as any).findFirst({
      filters: { slug: authorSlug },
      fields: ['name', 'slug'],
      populate: {
        memberProfile: true,
      },
    } as any);

    if (existingBySlug) {
      await syncProfileAuthor(strapi, profile, existingBySlug);
      return existingBySlug;
    }
  }

  const existingByName = await strapi.documents('api::author.author' as any).findFirst({
    filters: {
      name: {
        $eqi: name,
      },
    },
    fields: ['name', 'slug'],
    populate: {
      memberProfile: true,
    },
  } as any);

  if (existingByName) {
    await syncProfileAuthor(strapi, profile, existingByName);
    return existingByName;
  }

  const created = await strapi.documents('api::author.author' as any).create({
    data: {
      name,
      memberProfile: profile.id,
    },
  } as any);

  await syncProfileAuthor(strapi, profile, created);

  return created;
}

async function resolveAuthorIdForProfile(strapi: any, profile: any) {
  if (profile?.accountType !== 'author') {
    return null;
  }

  const author = await ensureAuthorEntryForProfile(strapi, profile);

  return author?.id ?? null;
}

async function resolveAccess(strapi: any, user: any) {
  if (!user) {
    throw new ForbiddenError('Требуется авторизация.');
  }

  const profile = await getMemberProfile(strapi, user.id);

  const isEditor = profile?.accountType === 'editor';
  const isApprovedAuthor = profile?.accountType === 'author' && profile?.isApprovedAuthor === true;

  if (!isEditor && !isApprovedAuthor) {
    throw new ForbiddenError('Доступ к редактору материалов закрыт.');
  }

  await ensureAuthorEntryForProfile(strapi, profile);

  return {
    profile,
    isEditor,
    allowedTypes: isEditor
      ? (['article', 'news', 'video', 'gallery', 'homepage'] as EditorType[])
      : (['article', 'news', 'video', 'gallery'] as EditorType[]),
  };
}

function normalizeBlocks(blocks: unknown) {
  if (!Array.isArray(blocks)) {
    return [];
  }

  return blocks.map((block) => {
    if (!block || typeof block !== 'object') {
      throw new ValidationError('Некорректный блок контента.');
    }

    const value = block as Record<string, unknown>;
    const component = typeof value.__component === 'string' ? value.__component : '';

    if (!ALLOWED_BLOCKS.has(component)) {
      throw new ValidationError('В редакторе доступны только разрешённые блоки контента.');
    }

    if (component === 'blocks.html-editor' || component === 'blocks.rich-text') {
      const rawContent = value.content;
      return {
        __component: 'blocks.html-editor',
        title: typeof value.title === 'string' ? value.title.trim() : null,
        content: serializeHtmlEditorContent(rawContent),
      };
    }

    if (component === 'blocks.embed') {
      const html = normalizeEmbedHtml(value.html);

      if (!html) {
        throw new ValidationError('Embed-блок должен содержать iframe или script код.');
      }

      return {
        __component: component,
        title: typeof value.title === 'string' ? value.title.trim() : null,
        html,
      };
    }

    if (component === 'blocks.image-highlight') {
      const image = Number(value.image);

      if (!Number.isInteger(image) || image <= 0) {
        throw new ValidationError('Для акцентного изображения нужен загруженный файл.');
      }

      return {
        __component: component,
        caption: typeof value.caption === 'string' ? value.caption.trim() : null,
        credit: typeof value.credit === 'string' ? value.credit.trim() : null,
        image,
      };
    }

    const images = Array.isArray(value.images)
      ? value.images.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0)
      : [];

    if (!images.length) {
      throw new ValidationError('Галерея и слайдер должны содержать хотя бы одно изображение.');
    }

    const normalizedBlock: Record<string, unknown> = {
      __component: component,
      title: typeof value.title === 'string' ? value.title.trim() : null,
      description: typeof value.description === 'string' ? value.description.trim() : null,
      images,
    };

    if (component === 'blocks.image-slider') {
      normalizedBlock.photoSource = typeof value.photoSource === 'string' ? value.photoSource.trim() : null;
    }

    return normalizedBlock;
  });
}

function normalizeSources(value: unknown) {
  const rawItems = Array.isArray(value) ? value : [];

  return rawItems
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const entry = item as Record<string, unknown>;
      const name = typeof entry.name === 'string' ? entry.name.trim() : '';
      const url = typeof entry.url === 'string' ? entry.url.trim() : '';

      if (!name) {
        return null;
      }

      return {
        name,
        url: url || null,
      };
    })
    .filter(Boolean);
}

function normalizeRelationIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as number[];
  }

  return value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function normalizeInfographicCards(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    if (!item || typeof item !== 'object') {
      throw new ValidationError('Некорректная карточка инфографики.');
    }

    const entry = item as Record<string, unknown>;
    const backgroundImage = entry.backgroundImage == null ? null : Number(entry.backgroundImage);
    const backgroundVideo = entry.backgroundVideo == null ? null : Number(entry.backgroundVideo);
    const cornerIcon = entry.cornerIcon == null ? null : Number(entry.cornerIcon);
    const shape = entry.shape === 'rectangle' || entry.shape === 'circle' ? entry.shape : 'square';
    const theme = entry.theme === 'dark' ? 'dark' : 'light';

    return {
      shape,
      title: typeof entry.title === 'string' ? entry.title.trim() : null,
      description: typeof entry.description === 'string' ? entry.description.trim() : null,
      href: typeof entry.href === 'string' ? entry.href.trim() : null,
      accentText: typeof entry.accentText === 'string' ? entry.accentText.trim() : null,
      backgroundImage: Number.isInteger(backgroundImage) && backgroundImage && backgroundImage > 0 ? backgroundImage : null,
      backgroundVideo: Number.isInteger(backgroundVideo) && backgroundVideo && backgroundVideo > 0 ? backgroundVideo : null,
      cornerIcon: Number.isInteger(cornerIcon) && cornerIcon && cornerIcon > 0 ? cornerIcon : null,
      theme,
    };
  });
}

const HOMEPAGE_INFOGRAPHIC_VERSION_LIMITS = {
  desktop: 8,
  tablet: 6,
  mobile: 7,
} as const;

type HomepageInfographicVersion = keyof typeof HOMEPAGE_INFOGRAPHIC_VERSION_LIMITS;

function padInfographicCards(cards: ReturnType<typeof normalizeInfographicCards>, limit: number) {
  const normalized = cards.slice(0, limit);

  while (normalized.length < limit) {
    normalized.push({
      shape: 'square',
      title: null,
      description: null,
      href: null,
      accentText: null,
      backgroundImage: null,
      backgroundVideo: null,
      cornerIcon: null,
      theme: 'light',
    });
  }

  return normalized;
}

function sliceLegacyInfographicCards(cards: ReturnType<typeof normalizeInfographicCards>, version: HomepageInfographicVersion) {
  if (version === 'desktop') {
    return cards.slice(0, HOMEPAGE_INFOGRAPHIC_VERSION_LIMITS.desktop);
  }

  if (version === 'tablet') {
    return cards
      .filter((_, index) => index !== 4 && index !== 9)
      .slice(0, HOMEPAGE_INFOGRAPHIC_VERSION_LIMITS.tablet);
  }

  const filteredCards = cards.filter((_, index) => index !== 4 && index !== 9);
  const videoCardIndex = filteredCards.findIndex((card) => Boolean(card.backgroundVideo));

  if (videoCardIndex === -1) {
    return filteredCards.slice(0, HOMEPAGE_INFOGRAPHIC_VERSION_LIMITS.mobile);
  }

  const fallbackCard = [...filteredCards].reverse().find((card, reverseIndex) => {
    const originalIndex = filteredCards.length - 1 - reverseIndex;
    return originalIndex !== videoCardIndex && !card.backgroundVideo;
  });

  if (!fallbackCard) {
    return filteredCards.filter((card) => !card.backgroundVideo).slice(0, HOMEPAGE_INFOGRAPHIC_VERSION_LIMITS.mobile);
  }

  return filteredCards
    .map((card, index) => (index === videoCardIndex ? fallbackCard : card))
    .filter((card, index, array) => array.findIndex((candidate) => candidate === card) === index)
    .slice(0, HOMEPAGE_INFOGRAPHIC_VERSION_LIMITS.mobile);
}

function normalizeHomepageInfographicVersionCards(
  value: unknown,
  fallbackCards: ReturnType<typeof normalizeInfographicCards>,
  version: HomepageInfographicVersion,
) {
  const directCards = normalizeInfographicCards(value);
  const cards = directCards.length ? directCards : sliceLegacyInfographicCards(fallbackCards, version);
  return padInfographicCards(cards, HOMEPAGE_INFOGRAPHIC_VERSION_LIMITS[version]);
}

function normalizeHomepageInfographicPayload(payload: Record<string, unknown>) {
  const legacyCards = normalizeInfographicCards(payload.infographicCards);

  return {
    infographicTitle: typeof payload.infographicTitle === 'string' ? payload.infographicTitle.trim() : null,
    infographicDescription: typeof payload.infographicDescription === 'string' ? payload.infographicDescription.trim() : null,
    infographicCardsDesktop: normalizeHomepageInfographicVersionCards(payload.infographicCardsDesktop, legacyCards, 'desktop'),
    infographicCardsTablet: normalizeHomepageInfographicVersionCards(payload.infographicCardsTablet, legacyCards, 'tablet'),
    infographicCardsMobile: normalizeHomepageInfographicVersionCards(payload.infographicCardsMobile, legacyCards, 'mobile'),
  };
}

async function findHomepageDocument(strapi: any, status?: 'published') {
  return strapi.documents(TYPE_CONFIG.homepage.uid as any).findFirst({
    populate: buildEditorPopulate('homepage'),
    ...(status ? { status } : {}),
  } as any);
}

function buildAuthorRecordHref(type: AuthorStatsType, slug?: string | null) {
  if (!slug) {
    return null;
  }

  return `${AUTHOR_STATS_TYPES[type].path}/${slug}`.replace(/\/+/g, '/');
}

function serializeAuthorRecord(type: AuthorStatsType, item: Record<string, any>) {
  const publishedAt = typeof item.publishedAt === 'string' && item.publishedAt.trim() ? item.publishedAt : null;
  const views = Number(item.views) > 0 ? Number(item.views) : 0;

  return {
    type,
    typeLabel: AUTHOR_STATS_TYPES[type].label,
    typeLabelEn: AUTHOR_STATS_TYPES[type].labelEn,
    documentId: item.documentId,
    title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : 'Без названия',
    slug: typeof item.slug === 'string' ? item.slug.trim() || null : null,
    href: buildAuthorRecordHref(type, typeof item.slug === 'string' ? item.slug.trim() : null),
    status: publishedAt ? 'published' : 'draft',
    publishedAt,
    updatedAt: typeof item.updatedAt === 'string' && item.updatedAt.trim() ? item.updatedAt : null,
    views,
  };
}

function mergeDraftAndPublishedItems(draftItems: Record<string, any>[], publishedItems: Record<string, any>[]) {
  const merged = new Map<string, Record<string, any>>();

  for (const item of draftItems) {
    if (typeof item.documentId !== 'string' || !item.documentId.trim()) {
      continue;
    }

    merged.set(item.documentId, item);
  }

  for (const item of publishedItems) {
    if (typeof item.documentId !== 'string' || !item.documentId.trim()) {
      continue;
    }

    const existing = merged.get(item.documentId);
    if (!existing) {
      merged.set(item.documentId, item);
      continue;
    }

    merged.set(item.documentId, {
      ...existing,
      ...item,
      views: Math.max(Number(existing.views) || 0, Number(item.views) || 0),
    });
  }

  return [...merged.values()];
}

async function resolveAuthorStats(strapi: any, author: Record<string, any>) {
  const recordGroups = await Promise.all(
    (Object.keys(AUTHOR_STATS_TYPES) as AuthorStatsType[]).map(async (type) => {
      const [draftItems, publishedItems] = await Promise.all([
        strapi.documents(AUTHOR_STATS_TYPES[type].uid as any).findMany({
          filters: {
            author: { id: author.id },
          },
          status: 'draft',
          fields: ['documentId', 'title', 'slug', 'publishedAt', 'updatedAt', 'views'],
          sort: ['updatedAt:desc'],
          limit: 10000,
        } as any),
        strapi.documents(AUTHOR_STATS_TYPES[type].uid as any).findMany({
          filters: {
            author: { id: author.id },
          },
          status: 'published',
          fields: ['documentId', 'title', 'slug', 'publishedAt', 'updatedAt', 'views'],
          sort: ['updatedAt:desc'],
          limit: 10000,
        } as any),
      ]);

      return mergeDraftAndPublishedItems(draftItems as Record<string, any>[], publishedItems as Record<string, any>[]).map((item) =>
        serializeAuthorRecord(type, item),
      );
    }),
  );

  const records = recordGroups.flat();
  const totals = records.reduce(
    (accumulator, record) => ({
      allRecords: accumulator.allRecords + 1,
      publishedRecords: accumulator.publishedRecords + (record.status === 'published' ? 1 : 0),
      views: accumulator.views + record.views,
    }),
    { allRecords: 0, publishedRecords: 0, views: 0 },
  );

  records.sort((left, right) => {
    const leftTime = left.publishedAt ?? left.updatedAt ?? '';
    const rightTime = right.publishedAt ?? right.updatedAt ?? '';

    return rightTime.localeCompare(leftTime);
  });

  return {
    author: {
      id: author.id,
      documentId: author.documentId,
      name: author.name,
      slug: author.slug ?? null,
    },
    totals,
    records,
  };
}

async function resolveMemberProfileStats(strapi: any, profile: Record<string, any>) {
  const recordGroups = await Promise.all(
    (Object.keys(AUTHOR_STATS_TYPES) as AuthorStatsType[]).map(async (type) => {
      const [draftItems, publishedItems] = await Promise.all([
        strapi.documents(AUTHOR_STATS_TYPES[type].uid as any).findMany({
          filters: {
            memberProfile: { id: profile.id },
          },
          status: 'draft',
          fields: ['documentId', 'title', 'slug', 'publishedAt', 'updatedAt', 'views'],
          sort: ['updatedAt:desc'],
          limit: 10000,
        } as any),
        strapi.documents(AUTHOR_STATS_TYPES[type].uid as any).findMany({
          filters: {
            memberProfile: { id: profile.id },
          },
          status: 'published',
          fields: ['documentId', 'title', 'slug', 'publishedAt', 'updatedAt', 'views'],
          sort: ['updatedAt:desc'],
          limit: 10000,
        } as any),
      ]);

      return mergeDraftAndPublishedItems(draftItems as Record<string, any>[], publishedItems as Record<string, any>[]).map((item) =>
        serializeAuthorRecord(type, item),
      );
    }),
  );

  const records = recordGroups.flat();
  const totals = records.reduce(
    (accumulator, record) => ({
      allRecords: accumulator.allRecords + 1,
      publishedRecords: accumulator.publishedRecords + (record.status === 'published' ? 1 : 0),
      views: accumulator.views + record.views,
    }),
    { allRecords: 0, publishedRecords: 0, views: 0 },
  );

  records.sort((left, right) => {
    const leftTime = left.publishedAt ?? left.updatedAt ?? '';
    const rightTime = right.publishedAt ?? right.updatedAt ?? '';

    return rightTime.localeCompare(leftTime);
  });

  return {
    author: {
      id: profile.id,
      documentId: profile.documentId,
      name: profile.displayName ?? 'Без имени',
      slug: profile.authorSlug ?? null,
    },
    totals,
    records,
  };
}

async function resolveViewsStats(strapi: any) {
  const recordGroups = await Promise.all(
    (Object.keys(VIEWS_STATS_TYPES) as ViewsStatsType[]).map(async (type) => {
      const [draftItems, publishedItems] = await Promise.all([
        strapi.documents(VIEWS_STATS_TYPES[type].uid as any).findMany({
          status: 'draft',
          fields: ['documentId', 'title', 'slug', 'publishedAt', 'updatedAt', 'views'],
          sort: ['updatedAt:desc'],
          limit: 10000,
        } as any),
        strapi.documents(VIEWS_STATS_TYPES[type].uid as any).findMany({
          status: 'published',
          fields: ['documentId', 'title', 'slug', 'publishedAt', 'updatedAt', 'views'],
          sort: ['updatedAt:desc'],
          limit: 10000,
        } as any),
      ]);

      return mergeDraftAndPublishedItems(draftItems as Record<string, any>[], publishedItems as Record<string, any>[]).map((item) =>
        serializeAuthorRecord(type, item),
      );
    }),
  );

  const records = recordGroups.flat();
  const totalsByType = records.reduce<Record<string, { records: number; views: number }>>((accumulator, record) => {
    const current = accumulator[record.type] ?? { records: 0, views: 0 };
    accumulator[record.type] = {
      records: current.records + 1,
      views: current.views + record.views,
    };

    return accumulator;
  }, {});
  const totals = records.reduce(
    (accumulator, record) => ({
      records: accumulator.records + 1,
      views: accumulator.views + record.views,
    }),
    { records: 0, views: 0 },
  );

  records.sort((left, right) => {
    if (left.type !== right.type) {
      return left.typeLabel.localeCompare(right.typeLabel, 'ru');
    }

    return right.views - left.views || left.title.localeCompare(right.title, 'ru');
  });

  return {
    generatedAt: new Date().toISOString(),
    totals,
    totalsByType,
    records,
  };
}

function serializeHomepageSummary(item: Record<string, any>, publishedItem: Record<string, any> | null) {
  return {
    documentId: item.documentId,
    title: item.infographicTitle?.trim() || 'Инфографика главной страницы',
    slug: '',
    excerpt: item.infographicDescription ?? item.description ?? '',
    status: publishedItem ? 'published' : 'draft',
    publishedAt: publishedItem?.publishedAt ?? null,
    updatedAt: item.updatedAt ?? publishedItem?.updatedAt ?? null,
    type: 'homepage',
  };
}

function normalizePayload(type: EditorType, payload: Record<string, unknown>, memberProfileId: number, resolvedAuthorId: number | null) {
  if (type === 'homepage') {
    return {
      data: normalizeHomepageInfographicPayload(payload),
      status: 'draft' as const,
    };
  }

  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const excerpt = typeof payload.excerpt === 'string' ? payload.excerpt.trim() : '';
  const slug = typeof payload.slug === 'string' ? payload.slug.trim() : '';
  const materialLabelRaw = typeof payload.materialLabel === 'string' ? payload.materialLabel.trim() : '';
  const materialLabel = materialLabelRaw === 'exclusive' || materialLabelRaw === 'video' || materialLabelRaw === 'none'
    ? materialLabelRaw
    : 'none';
  const cover = payload.cover ? Number(payload.cover) : null;
  const archiveCover = payload.archiveCover ? Number(payload.archiveCover) : null;
  const requestedStatus = payload.status === 'published' || payload.status === 'preview' ? payload.status : 'draft';
  const status = requestedStatus === 'published' ? 'published' : 'draft';
  const publishedAtCustom = typeof payload.publishedAtCustom === 'string' ? payload.publishedAtCustom.trim() : '';
  const seoPayload = payload.seo && typeof payload.seo === 'object' ? (payload.seo as Record<string, unknown>) : null;
  const categories = normalizeRelationIds(payload.categories);
  const tags = normalizeRelationIds(payload.tags);
  const sources = normalizeSources(payload.sources);
  const coverSource = typeof payload.coverSource === 'string' ? payload.coverSource.trim() : '';
  const photos = type === 'gallery' ? normalizeRelationIds(payload.photos) : [];
  const blocks = type === 'gallery' ? [] : normalizeBlocks(payload.blocks);

  if (!title) {
    throw new ValidationError('Укажите заголовок.');
  }

  if (type === 'gallery' && !excerpt) {
    throw new ValidationError('Для галереи обязательно описание.');
  }

  if ((type === 'article' || type === 'news') && requestedStatus === 'published' && !excerpt) {
    throw new ValidationError('Для публикации нужно заполнить краткое описание.');
  }

  if (type === 'video' && !excerpt) {
    throw new ValidationError('Для видео обязательно краткое описание.');
  }

  if (type === 'gallery') {
    return {
      data: {
        title,
        excerpt,
        slug: slug || undefined,
        cover: Number.isInteger(cover) && cover && cover > 0 ? cover : null,
        archiveCover: Number.isInteger(archiveCover) && archiveCover && archiveCover > 0 ? archiveCover : null,
        photos,
        memberProfile: memberProfileId,
        author: Number.isInteger(resolvedAuthorId) && resolvedAuthorId && resolvedAuthorId > 0 ? resolvedAuthorId : null,
        publishedAtCustom: publishedAtCustom || new Date().toISOString(),
        categories,
        coverSource: coverSource || null,
        preview: requestedStatus === 'preview',
        seo: seoPayload
          ? {
              metaTitle: typeof seoPayload.metaTitle === 'string' ? seoPayload.metaTitle.trim() : null,
              metaDescription: typeof seoPayload.metaDescription === 'string' ? seoPayload.metaDescription.trim() : null,
              keywords: typeof seoPayload.keywords === 'string' ? seoPayload.keywords.trim() : null,
              canonicalUrl: typeof seoPayload.canonicalUrl === 'string' ? seoPayload.canonicalUrl.trim() : null,
              noIndex: seoPayload.noIndex === true,
              noFollow: seoPayload.noFollow === true,
            }
          : null,
      },
      status,
    };
  }

  const data: Record<string, unknown> = {
    title,
    excerpt,
    slug: slug || undefined,
    materialLabel,
    cover: Number.isInteger(cover) && cover && cover > 0 ? cover : null,
    archiveCover: Number.isInteger(archiveCover) && archiveCover && archiveCover > 0 ? archiveCover : null,
    content: blocks,
    memberProfile: memberProfileId,
    author: Number.isInteger(resolvedAuthorId) && resolvedAuthorId && resolvedAuthorId > 0 ? resolvedAuthorId : null,
    publishedAtCustom: publishedAtCustom || new Date().toISOString(),
    categories,
    tags,
    coverSource: coverSource || null,
    preview: requestedStatus === 'preview',
    homepageSpecialBlock: payload.homepageSpecialBlock === true,
    seo: seoPayload
      ? {
          metaTitle: typeof seoPayload.metaTitle === 'string' ? seoPayload.metaTitle.trim() : null,
          metaDescription: typeof seoPayload.metaDescription === 'string' ? seoPayload.metaDescription.trim() : null,
          keywords: typeof seoPayload.keywords === 'string' ? seoPayload.keywords.trim() : null,
          canonicalUrl: typeof seoPayload.canonicalUrl === 'string' ? seoPayload.canonicalUrl.trim() : null,
          noIndex: seoPayload.noIndex === true,
          noFollow: seoPayload.noFollow === true,
        }
      : null,
  };

  if (type === 'article') {
    data.readingTime = Math.max(1, Number(payload.readingTime) || 5);
    data.editorialStatus = requestedStatus === 'published' ? 'published' : requestedStatus === 'preview' ? 'in_review' : 'draft';
    data.submittedAt = new Date().toISOString();
    data.sources = sources;
  }

    if (type === 'news') {
      data.sources = sources;
      data.sourceName = sources[0]?.name ?? null;
      data.sourceUrl = sources[0]?.url ?? null;
      data.publishedAt = status === 'published' ? publishedAtCustom || new Date().toISOString() : null;
    }

  if (type === 'video') {
    const videoUrl = typeof payload.videoUrl === 'string' ? payload.videoUrl.trim() : '';

    if (!videoUrl) {
      throw new ValidationError('Для видео обязателен URL ролика.');
    }

    data.videoUrl = videoUrl;
    data.duration = Math.max(1, Number(payload.duration) || 1);
  }

  return { data, status, editorStatus: requestedStatus };
}

function serializeSummary(type: EditorType, item: Record<string, any>) {
  const previewStatus = !item.publishedAt && (item.editorialStatus === 'in_review' || item.preview === true) ? 'preview' : null;

  return {
    documentId: item.documentId,
    title: item.title,
    slug: item.slug ?? '',
    excerpt: item.excerpt ?? '',
    status: item.publishedAt ? 'published' : previewStatus ?? 'draft',
    publishedAt: item.publishedAt ?? null,
    updatedAt: item.updatedAt ?? null,
    type,
  };
}

async function findPublishedDocument(strapi: any, type: EditorType, documentId: string, profileId?: number) {
  return strapi.documents(TYPE_CONFIG[type].uid as any).findFirst({
    filters: {
      documentId,
      ...(profileId ? { memberProfile: { id: profileId } } : {}),
    },
    status: 'published',
    fields: TYPE_CONFIG[type].summaryFields,
    populate: buildEditorPopulate(type),
  } as any);
}

function mergeEditorStatus<T extends Record<string, any>>(draftItem: T, publishedItem: Record<string, any> | null) {
  const previewStatus = !publishedItem && (draftItem?.editorialStatus === 'in_review' || draftItem?.preview === true) ? 'preview' : null;

  return {
    ...draftItem,
    editorStatus: publishedItem ? 'published' : previewStatus ?? 'draft',
    publishedAt: publishedItem?.publishedAt ?? null,
  };
}

function mergeListItems(type: EditorType, draftItems: Record<string, any>[], publishedItems: Record<string, any>[]) {
  const publishedMap = new Map(publishedItems.map((item) => [item.documentId, item]));
  const merged = new Map<string, Record<string, any>>();

  for (const item of publishedItems) {
    merged.set(item.documentId, {
      ...serializeSummary(type, item),
      status: 'published',
    });
  }

  for (const item of draftItems) {
    merged.set(item.documentId, {
      ...serializeSummary(type, item),
      status: publishedMap.has(item.documentId) ? 'published' : 'draft',
    });
  }

  return [...merged.values()].sort((left, right) => {
    const leftDate = Date.parse(left.updatedAt ?? left.publishedAt ?? '') || 0;
    const rightDate = Date.parse(right.updatedAt ?? right.publishedAt ?? '') || 0;

    return rightDate - leftDate;
  });
}

export default factories.createCoreController('api::member-profile.member-profile' as any, ({ strapi }) => ({
  async session(ctx: any) {
    const access = await resolveAccess(strapi, ctx.state.user ?? null);
    const canCreate = access.allowedTypes;

    ctx.body = {
      authenticated: true,
      user: {
        id: ctx.state.user.id,
        username: ctx.state.user.username,
        email: ctx.state.user.email,
        memberProfile: access.profile,
      },
      capabilities: {
        canUseEditor: true,
        canCreate,
        canEditAll: access.isEditor,
      },
    };
  },

  async list(ctx: any) {
    const rawType = typeof ctx.params.type === 'string' ? ctx.params.type.trim() : '';

    if (!isEditorType(rawType)) {
      throw new ValidationError('Неизвестный тип материала.');
    }

    const access = await resolveAccess(strapi, ctx.state.user ?? null);

    if (!access.allowedTypes.includes(rawType)) {
      throw new ForbiddenError('Этот тип материала вам недоступен.');
    }

    if (rawType === 'homepage') {
      const [item, publishedItem] = await Promise.all([
        findHomepageDocument(strapi),
        findHomepageDocument(strapi, 'published'),
      ]);

      const resolvedItem = item ?? publishedItem;

      ctx.body = resolvedItem ? [serializeHomepageSummary(resolvedItem, publishedItem ?? null)] : [];
      return;
    }

    const filters = access.isEditor ? {} : { memberProfile: { id: access.profile.id } };

    const [items, publishedItems] = await Promise.all([
      strapi.documents(TYPE_CONFIG[rawType].uid as any).findMany({
        filters,
        sort: ['updatedAt:desc'],
        fields: TYPE_CONFIG[rawType].summaryFields,
      } as any),
      strapi.documents(TYPE_CONFIG[rawType].uid as any).findMany({
        filters,
        sort: ['updatedAt:desc'],
        fields: TYPE_CONFIG[rawType].summaryFields,
        status: 'published',
      } as any),
    ]);

    ctx.body = mergeListItems(rawType, items, publishedItems);
  },

  async findOne(ctx: any) {
    const rawType = typeof ctx.params.type === 'string' ? ctx.params.type.trim() : '';
    const documentId = typeof ctx.params.documentId === 'string' ? ctx.params.documentId.trim() : '';

    if (!isEditorType(rawType) || !documentId) {
      throw new ValidationError('Некорректный запрос редактора.');
    }

    const access = await resolveAccess(strapi, ctx.state.user ?? null);

    if (!access.allowedTypes.includes(rawType)) {
      throw new ForbiddenError('Этот тип материала вам недоступен.');
    }

    if (rawType === 'homepage') {
      const [item, publishedItem] = await Promise.all([
        findHomepageDocument(strapi),
        findHomepageDocument(strapi, 'published'),
      ]);

      const resolvedItem = item ?? publishedItem;

      if (!resolvedItem || resolvedItem.documentId !== documentId) {
        throw new NotFoundError('Настройки инфографики не найдены.');
      }

      ctx.body = mergeEditorStatus(resolvedItem, publishedItem ?? null);
      return;
    }

    const profileId = access.isEditor ? undefined : access.profile.id;
    const [item, publishedItem] = await Promise.all([
      strapi.documents(TYPE_CONFIG[rawType].uid as any).findFirst({
        filters: {
          documentId,
          ...(profileId ? { memberProfile: { id: profileId } } : {}),
        },
        populate: buildEditorPopulate(rawType),
      } as any),
      findPublishedDocument(strapi, rawType, documentId, profileId),
    ]);

    const resolvedItem = item ?? publishedItem;

    if (!resolvedItem) {
      throw new NotFoundError('Материал не найден.');
    }

    ctx.body = mergeEditorStatus(resolvedItem, publishedItem ?? null);
  },

  async authors(ctx: any) {
    const access = await resolveAccess(strapi, ctx.state.user ?? null);

    if (!access.isEditor) {
      const author = await ensureAuthorEntryForProfile(strapi, access.profile);

      ctx.body = author
        ? [
            {
              id: author.id,
              name: author.name,
            },
          ]
        : [];

      return;
    }

    const approvedProfiles = await strapi.db.query('api::member-profile.member-profile').findMany({
      where: {
        accountType: 'author',
        isApprovedAuthor: true,
      },
    });

    await Promise.all(approvedProfiles.map((profile: any) => ensureAuthorEntryForProfile(strapi, profile)));

    const authors = await strapi.documents('api::author.author' as any).findMany({
      sort: ['name:asc'],
      fields: ['name'],
    } as any);

    ctx.body = authors.map((author: Record<string, any>) => ({
      id: author.id,
      name: author.name,
    }));
  },

  async categories(ctx: any) {
    await resolveAccess(strapi, ctx.state.user ?? null);

    const categories = await strapi.documents('api::category.category' as any).findMany({
      sort: ['name:asc'],
      fields: ['name', 'slug'],
      populate: {
        parent: {
          fields: ['name'],
        },
      },
    } as any);

    ctx.body = categories.map((category: Record<string, any>) => ({
      id: category.id,
      name: category.parent?.name ? `${category.parent.name} / ${category.name}` : category.name,
      slug: category.slug ?? null,
    }));
  },

  async tags(ctx: any) {
    await resolveAccess(strapi, ctx.state.user ?? null);

    const tags = await strapi.documents('api::tag.tag' as any).findMany({
      sort: ['name:asc'],
      fields: ['name', 'slug'],
    } as any);

    ctx.body = tags.map((tag: Record<string, any>) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug ?? null,
    }));
  },

  async media(ctx: any) {
    await resolveAccess(strapi, ctx.state.user ?? null);

    const assets = await strapi.db.query('plugin::upload.file').findMany({
      orderBy: { createdAt: 'desc' },
      limit: 100,
    });

    ctx.body = assets.map((asset: Record<string, any>) => serializeUploadedAsset(asset));
  },

  async authorStats(ctx: any) {
    const documentId = typeof ctx.params.documentId === 'string' ? ctx.params.documentId.trim() : '';

    if (!documentId) {
      throw new ValidationError('Некорректный запрос статистики автора.');
    }

    const author = await strapi.documents('api::author.author' as any).findFirst({
      filters: { documentId },
      fields: ['name', 'slug', 'documentId'],
    } as any);

    if (!author) {
      throw new NotFoundError('Автор не найден.');
    }

    ctx.body = await resolveAuthorStats(strapi, author);
  },

  async viewsStats(ctx: any) {
    ctx.body = await resolveViewsStats(strapi);
  },

  async memberProfileStats(ctx: any) {
    const documentId = typeof ctx.params.documentId === 'string' ? ctx.params.documentId.trim() : '';

    if (!documentId) {
      throw new ValidationError('Некорректный запрос статистики профиля.');
    }

    const profile = await strapi.documents('api::member-profile.member-profile' as any).findFirst({
      filters: { documentId },
      fields: ['displayName', 'accountType', 'authorSlug', 'documentId'],
    } as any);

    if (!profile) {
      throw new NotFoundError('Профиль участника не найден.');
    }

    if (profile.accountType !== 'editor') {
      ctx.body = { eligible: false };
      return;
    }

    ctx.body = {
      eligible: true,
      ...(await resolveMemberProfileStats(strapi, profile)),
    };
  },

  async trackView(ctx: any) {
    const rawType = typeof ctx.params.type === 'string' ? ctx.params.type.trim() : '';
    const documentId = typeof ctx.params.documentId === 'string' ? ctx.params.documentId.trim() : '';

    if (!isAuthorStatsType(rawType) || !documentId) {
      throw new ValidationError('Некорректный запрос счётчика просмотров.');
    }

    const uid = AUTHOR_STATS_TYPES[rawType].uid;
    const documents = await strapi.db.query(uid as any).findMany({
      where: { documentId },
      select: ['id', 'documentId', 'views'],
    } as any);

    if (!documents.length) {
      throw new NotFoundError('Материал для счётчика просмотров не найден.');
    }

    const nextViews = Math.max(...documents.map((item: Record<string, any>) => Number(item.views) || 0)) + 1;

    const updateResults = await Promise.allSettled(
      documents.map((item: Record<string, any>) =>
        strapi.db.query(uid as any).update({
          where: { id: item.id },
          data: { views: nextViews },
        } as any),
      ),
    );

    if (updateResults.every((result) => result.status === 'rejected')) {
      throw updateResults[0]?.status === 'rejected'
        ? updateResults[0].reason
        : new Error('Не удалось обновить счётчик просмотров.');
    }

    ctx.body = {
      ok: true,
      documentId,
      views: nextViews,
    };
  },

  async upload(ctx: any) {
    const user =
      ctx.state.user ??
      (await resolveUsersPermissionsUser(strapi, ctx.request.header?.authorization ?? null)) ??
      (await resolveUsersPermissionsUserFromCookie(strapi, ctx.cookies?.get('vino_auth_jwt') ?? null));

    const access = await resolveAccess(strapi, user);

    const files = normalizeRequestFiles(ctx.request.files);

    strapi.log.info(
      `[editor.upload] content-type=${ctx.request.headers?.['content-type'] ?? 'unknown'} files=${files.length} bodyKeys=${Object.keys(ctx.request.body ?? {}).join(',') || 'none'}`,
    );

    let cleanupDirectory: string | null = null;
    let resolvedFiles = files;

    if (!resolvedFiles.length) {
      const fallbackUpload = await createUploadFileFromBase64(ctx.request.body ?? {});

      if (fallbackUpload) {
        cleanupDirectory = fallbackUpload.cleanupDirectory;
        resolvedFiles = [fallbackUpload.file];
        strapi.log.warn('[editor.upload] multipart parsing returned no files, using base64 fallback upload');
      }
    }

    if (!resolvedFiles.length) {
      strapi.log.warn('[editor.upload] upload rejected: request did not contain files');
      throw new ValidationError('Не передан файл для загрузки.');
    }

    const fileInfo = ctx.request.body?.fileInfo;
    const data = fileInfo ? { fileInfo } : {};

    try {
      const uploaded = await strapi.plugin('upload').service('upload').upload({
        data,
        files: resolvedFiles.length === 1 ? resolvedFiles[0] : resolvedFiles,
      });

      ctx.body = (Array.isArray(uploaded) ? uploaded : [uploaded]).map((asset: Record<string, any>) => serializeUploadedAsset(asset));
    } finally {
      if (cleanupDirectory) {
        await fs.rm(cleanupDirectory, { recursive: true, force: true });
      }
    }
  },

  async save(ctx: any) {
    const rawType = typeof ctx.params.type === 'string' ? ctx.params.type.trim() : '';
    const documentId = typeof ctx.params.documentId === 'string' ? ctx.params.documentId.trim() : '';

    if (!isEditorType(rawType)) {
      throw new ValidationError('Неизвестный тип материала.');
    }

    const access = await resolveAccess(strapi, ctx.state.user ?? null);

    if (!access.allowedTypes.includes(rawType)) {
      throw new ForbiddenError('Этот тип материала вам недоступен.');
    }

    const payload = (ctx.request.body?.data ?? ctx.request.body ?? {}) as Record<string, unknown>;
    const resolvedAuthorId = access.isEditor
      ? (payload.author ? Number(payload.author) : null)
      : await resolveAuthorIdForProfile(strapi, access.profile);
    const normalized = normalizePayload(rawType, payload, access.profile.id, resolvedAuthorId);

    if (rawType !== 'homepage') {
      strapi.log.info(
        `[editor.save] type=${rawType} uid=${TYPE_CONFIG[rawType].uid} runtimeHasCoverSource=${String(runtimeHasAttribute(strapi, rawType, 'coverSource'))}`,
      );
      sanitizeEditorDataForRuntime(strapi, rawType, normalized.data);
    }

    if (rawType === 'homepage') {
      if (!documentId) {
        throw new ForbiddenError('Создание отдельной записи инфографики недоступно: используется единственная системная запись homepage.');
      }

      const [existing, publishedItem] = await Promise.all([
        findHomepageDocument(strapi),
        findHomepageDocument(strapi, 'published'),
      ]);
      const resolvedExisting = existing ?? publishedItem;

      if (!resolvedExisting || resolvedExisting.documentId !== documentId) {
        throw new NotFoundError('Настройки инфографики не найдены.');
      }

      await strapi.documents(TYPE_CONFIG.homepage.uid as any).update({
        documentId,
        data: normalized.data,
      } as any);

      if (publishedItem?.documentId === documentId) {
        await strapi.documents(TYPE_CONFIG.homepage.uid as any).publish({ documentId } as any);
      }

      const [savedDraft, savedPublished] = await Promise.all([
        findHomepageDocument(strapi),
        findHomepageDocument(strapi, 'published'),
      ]);
      const resolvedSaved = savedDraft ?? savedPublished;

      if (!resolvedSaved) {
        throw new NotFoundError('Не удалось загрузить обновлённые настройки инфографики.');
      }

      ctx.body = mergeEditorStatus(resolvedSaved, savedPublished ?? null);
      return;
    }

    if (documentId) {
      const existing = await strapi.documents(TYPE_CONFIG[rawType].uid as any).findFirst({
        filters: {
          documentId,
          ...(access.isEditor ? {} : { memberProfile: { id: access.profile.id } }),
        },
      } as any);

      if (!existing) {
        throw new NotFoundError('Материал не найден или недоступен.');
      }

      delete (normalized.data as Record<string, unknown>).slug;

      const savedDocument = await strapi.documents(TYPE_CONFIG[rawType].uid as any).update({
        documentId,
        data: normalized.data,
        ...(normalized.status === 'published' ? { status: 'published' } : {}),
      } as any);

      if (normalized.status === 'draft') {
        if (normalized.editorStatus === 'preview') {
          await strapi.documents(TYPE_CONFIG[rawType].uid as any).publish({ documentId } as any);
        } else {
          await strapi.documents(TYPE_CONFIG[rawType].uid as any).unpublish({ documentId } as any).catch(() => null);
        }
      }

      const [savedDraft, savedPublished] = await Promise.all([
        strapi.documents(TYPE_CONFIG[rawType].uid as any).findFirst({
          filters: {
            documentId: savedDocument?.documentId ?? documentId,
            ...(access.isEditor ? {} : { memberProfile: { id: access.profile.id } }),
          },
          populate: buildEditorPopulate(rawType),
        } as any),
        findPublishedDocument(strapi, rawType, savedDocument?.documentId ?? documentId, access.isEditor ? undefined : access.profile.id),
      ]);

      ctx.body = mergeEditorStatus(savedDraft, savedPublished ?? null);
      return;
    }

    const created = await strapi.documents(TYPE_CONFIG[rawType].uid as any).create({
      data: normalized.data,
    } as any);

    if (normalized.status === 'published' || normalized.editorStatus === 'preview') {
      await strapi.documents(TYPE_CONFIG[rawType].uid as any).publish({
        documentId: created.documentId,
      } as any);
    }

    const [createdDraft, publishedItem] = await Promise.all([
      strapi.documents(TYPE_CONFIG[rawType].uid as any).findFirst({
        filters: {
          documentId: created.documentId,
          ...(access.isEditor ? {} : { memberProfile: { id: access.profile.id } }),
        },
        populate: buildEditorPopulate(rawType),
      } as any),
      normalized.status === 'published' || normalized.editorStatus === 'preview'
        ? findPublishedDocument(strapi, rawType, created.documentId, access.isEditor ? undefined : access.profile.id)
        : Promise.resolve(null),
    ]);

    ctx.body = mergeEditorStatus(createdDraft, publishedItem ?? null);
  },

  async delete(ctx: any) {
    const rawType = typeof ctx.params.type === 'string' ? ctx.params.type.trim() : '';
    const documentId = typeof ctx.params.documentId === 'string' ? ctx.params.documentId.trim() : '';

    if (!isEditorType(rawType) || !documentId) {
      throw new ValidationError('Некорректный запрос редактора.');
    }

    const access = await resolveAccess(strapi, ctx.state.user ?? null);

    if (!access.allowedTypes.includes(rawType)) {
      throw new ForbiddenError('Этот тип материала вам недоступен.');
    }

    if (rawType === 'homepage') {
      throw new ForbiddenError('Удаление системной записи инфографики недоступно.');
    }

    const existing = await strapi.documents(TYPE_CONFIG[rawType].uid as any).findFirst({
      filters: {
        documentId,
        ...(access.isEditor ? {} : { memberProfile: { id: access.profile.id } }),
      },
      fields: ['documentId'],
    } as any);

    if (!existing) {
      throw new NotFoundError('Материал не найден или недоступен.');
    }

    await strapi.documents(TYPE_CONFIG[rawType].uid as any).delete({
      documentId,
    } as any);

    ctx.body = { ok: true, documentId };
  },
}));
