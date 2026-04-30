import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ForbiddenError, NotFoundError, ValidationError } = errors;

const TYPE_CONFIG = {
  article: {
    uid: 'api::article.article',
    summaryFields: ['title', 'slug', 'excerpt', 'documentId', 'updatedAt', 'publishedAt'],
  },
  news: {
    uid: 'api::news.news',
    summaryFields: ['title', 'slug', 'excerpt', 'documentId', 'updatedAt', 'publishedAt'],
  },
  video: {
    uid: 'api::video.video',
    summaryFields: ['title', 'slug', 'excerpt', 'documentId', 'updatedAt', 'publishedAt'],
  },
  homepage: {
    uid: 'api::homepage.homepage',
    summaryFields: ['title', 'documentId', 'updatedAt', 'publishedAt'],
  },
} as const;

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

function buildEditorPopulate(type: EditorType) {
  if (type === 'homepage') {
    return {
      infographicCards: {
        populate: {
          backgroundImage: true,
          backgroundVideo: true,
        },
      },
      blocks: { populate: '*' },
      seo: true,
    };
  }

  return {
    cover: true,
    content: { populate: '*' },
    author: true,
    categories: true,
    tags: true,
    sources: true,
    seo: true,
  };
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

  return {
    profile,
    isEditor,
    allowedTypes: isEditor
      ? (['article', 'news', 'video', 'homepage'] as EditorType[])
      : (['article', 'news', 'video'] as EditorType[]),
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

    return {
      __component: component,
      title: typeof value.title === 'string' ? value.title.trim() : null,
      description: typeof value.description === 'string' ? value.description.trim() : null,
      images,
    };
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
      theme,
    };
  });
}

async function findHomepageDocument(strapi: any, status?: 'published') {
  return strapi.documents(TYPE_CONFIG.homepage.uid as any).findFirst({
    populate: buildEditorPopulate('homepage'),
    ...(status ? { status } : {}),
  } as any);
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
      data: {
        infographicTitle: typeof payload.infographicTitle === 'string' ? payload.infographicTitle.trim() : null,
        infographicDescription: typeof payload.infographicDescription === 'string' ? payload.infographicDescription.trim() : null,
        infographicCards: normalizeInfographicCards(payload.infographicCards),
      },
      status: 'draft' as const,
    };
  }

  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const excerpt = typeof payload.excerpt === 'string' ? payload.excerpt.trim() : '';
  const slug = typeof payload.slug === 'string' ? payload.slug.trim() : '';
  const cover = payload.cover ? Number(payload.cover) : null;
  const blocks = normalizeBlocks(payload.blocks);
  const status = payload.status === 'published' ? 'published' : 'draft';
  const publishedAtCustom = typeof payload.publishedAtCustom === 'string' ? payload.publishedAtCustom.trim() : '';
  const seoPayload = payload.seo && typeof payload.seo === 'object' ? (payload.seo as Record<string, unknown>) : null;
  const categories = normalizeRelationIds(payload.categories);
  const tags = normalizeRelationIds(payload.tags);
  const sources = normalizeSources(payload.sources);

  if (!title || !excerpt) {
    throw new ValidationError('Укажите заголовок и краткое описание.');
  }

  const data: Record<string, unknown> = {
    title,
    excerpt,
    slug: slug || undefined,
    cover: Number.isInteger(cover) && cover && cover > 0 ? cover : null,
    content: blocks,
    memberProfile: memberProfileId,
    author: Number.isInteger(resolvedAuthorId) && resolvedAuthorId && resolvedAuthorId > 0 ? resolvedAuthorId : null,
    publishedAtCustom: publishedAtCustom || new Date().toISOString(),
    categories,
    tags,
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
    data.editorialStatus = status === 'published' ? 'published' : 'draft';
    data.submittedAt = new Date().toISOString();
    data.sources = sources;
  }

  if (type === 'news') {
    data.sources = sources;
    data.sourceName = sources[0]?.name ?? null;
    data.sourceUrl = sources[0]?.url ?? null;
  }

  if (type === 'video') {
    const videoUrl = typeof payload.videoUrl === 'string' ? payload.videoUrl.trim() : '';

    if (!videoUrl) {
      throw new ValidationError('Для видео обязателен URL ролика.');
    }

    data.videoUrl = videoUrl;
    data.duration = Math.max(1, Number(payload.duration) || 1);
  }

  return { data, status };
}

function serializeSummary(type: EditorType, item: Record<string, any>) {
  return {
    documentId: item.documentId,
    title: item.title,
    slug: item.slug ?? '',
    excerpt: item.excerpt ?? '',
    status: item.publishedAt ? 'published' : 'draft',
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
  return {
    ...draftItem,
    editorStatus: publishedItem ? 'published' : 'draft',
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

  async upload(ctx: any) {
    await resolveAccess(strapi, ctx.state.user ?? null);

    const files = normalizeRequestFiles(ctx.request.files);

    if (!files.length) {
      throw new ValidationError('Не передан файл для загрузки.');
    }

    const fileInfo = ctx.request.body?.fileInfo;
    const data = fileInfo ? { fileInfo } : {};
    const uploaded = await strapi.plugin('upload').service('upload').upload({
      data,
      files: files.length === 1 ? files[0] : files,
    });

    ctx.body = (Array.isArray(uploaded) ? uploaded : [uploaded]).map((asset: Record<string, any>) => serializeUploadedAsset(asset));
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

      delete normalized.data.slug;

      await strapi.documents(TYPE_CONFIG[rawType].uid as any).update({
        documentId,
        data: normalized.data,
        ...(normalized.status === 'published' ? { status: 'published' } : {}),
      } as any);

      if (normalized.status === 'draft') {
        await strapi.documents(TYPE_CONFIG[rawType].uid as any).unpublish({ documentId } as any).catch(() => null);
      }

      const [savedDraft, savedPublished] = await Promise.all([
        strapi.documents(TYPE_CONFIG[rawType].uid as any).findFirst({
          filters: {
            documentId,
            ...(access.isEditor ? {} : { memberProfile: { id: access.profile.id } }),
          },
          populate: buildEditorPopulate(rawType),
        } as any),
        findPublishedDocument(strapi, rawType, documentId, access.isEditor ? undefined : access.profile.id),
      ]);

      ctx.body = mergeEditorStatus(savedDraft, savedPublished ?? null);
      return;
    }

    const created = await strapi.documents(TYPE_CONFIG[rawType].uid as any).create({
      data: normalized.data,
    } as any);

    if (normalized.status === 'published') {
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
      normalized.status === 'published'
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
