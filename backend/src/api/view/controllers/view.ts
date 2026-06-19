import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import crypto from 'crypto';

const { ValidationError, NotFoundError } = errors;

const ALLOWED_CONTENT_TYPES = new Set([
  'api::article.article',
  'api::news.news',
  'api::video.video',
  'api::gallery.gallery',
]);

function resolveViewerId(ctx: any): string {
  const fromBody = typeof ctx.request.body?.data?.viewerId === 'string'
    ? ctx.request.body.data.viewerId.trim()
    : '';
  const fromHeader = typeof ctx.request.header?.['x-viewer-id'] === 'string'
    ? ctx.request.header['x-viewer-id'].trim()
    : '';

  if (fromBody || fromHeader) {
    return fromBody || fromHeader;
  }

  const ip = ctx.request.ip ?? '';
  const userAgent = ctx.request.header?.['user-agent'] ?? '';

  if (!ip && !userAgent) {
    return '';
  }

  return crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}`)
    .digest('hex')
    .slice(0, 32);
}

async function getPublishedViews(strapi: any, contentTypeUid: string, documentId: string): Promise<number> {
  const entry = await strapi.db.query(contentTypeUid).findOne({
    where: {
      documentId,
      publishedAt: { $notNull: true },
    },
  });

  return typeof entry?.views === 'number' ? entry.views : 0;
}

export default factories.createCoreController('api::view.view' as any, ({ strapi }) => ({
  async increment(ctx) {
    const payload = ctx.request.body?.data ?? ctx.request.body ?? {};
    const contentTypeUid = typeof payload.contentTypeUid === 'string' ? payload.contentTypeUid.trim() : '';
    const targetDocumentId = typeof payload.targetDocumentId === 'string' ? payload.targetDocumentId.trim() : '';
    const targetSlug = typeof payload.targetSlug === 'string' ? payload.targetSlug.trim() : '';
    const viewerId = resolveViewerId(ctx);

    if (!ALLOWED_CONTENT_TYPES.has(contentTypeUid)) {
      throw new ValidationError('Некорректный тип материала.');
    }

    if (!targetDocumentId) {
      throw new ValidationError('Не указан идентификатор материала.');
    }

    if (!viewerId) {
      throw new ValidationError('Не удалось определить просмотр.');
    }

    const existing = await strapi.db.query('api::view.view').findOne({
      where: {
        contentTypeUid,
        targetDocumentId,
        viewerId,
      },
    });

    if (existing) {
      const views = await getPublishedViews(strapi, contentTypeUid, targetDocumentId);
      ctx.body = { views, counted: false };
      return;
    }

    await strapi.db.query('api::view.view').create({
      data: {
        contentTypeUid,
        targetDocumentId,
        targetSlug,
        viewerId,
        ip: ctx.request.ip ?? null,
        userAgent: ctx.request.header?.['user-agent'] ?? null,
        viewedAt: new Date(),
      },
    });

    const publishedEntry = await strapi.db.query(contentTypeUid).findOne({
      where: {
        documentId: targetDocumentId,
        publishedAt: { $notNull: true },
      },
    });

    if (!publishedEntry) {
      throw new NotFoundError('Материал не найден.');
    }

    const nextViews = (typeof publishedEntry.views === 'number' ? publishedEntry.views : 0) + 1;

    await strapi.db.query(contentTypeUid).update({
      where: { id: publishedEntry.id },
      data: { views: nextViews },
    });

    ctx.body = { views: nextViews, counted: true };
  },

  async summary(ctx) {
    const contentTypeUid = typeof ctx.request.query.contentTypeUid === 'string' ? ctx.request.query.contentTypeUid.trim() : '';
    const targetDocumentId = typeof ctx.request.query.targetDocumentId === 'string' ? ctx.request.query.targetDocumentId.trim() : '';

    if (!ALLOWED_CONTENT_TYPES.has(contentTypeUid)) {
      throw new ValidationError('Некорректный тип материала.');
    }

    if (!targetDocumentId) {
      throw new ValidationError('Не указан идентификатор материала.');
    }

    const count = await strapi.db.query('api::view.view').count({
      where: { contentTypeUid, targetDocumentId },
    });

    const entryViews = await getPublishedViews(strapi, contentTypeUid, targetDocumentId);

    ctx.body = { count, views: entryViews };
  },

  async authorStats(ctx) {
    const rawId = typeof ctx.params.documentId === 'string' ? ctx.params.documentId.trim() : '';

    if (!rawId) {
      throw new ValidationError('Не указан автор.');
    }

    const numericId = Number(rawId);
    const useNumericId = !Number.isNaN(numericId) && rawId === String(numericId);
    const authorFilter = useNumericId ? { id: numericId } : { documentId: rawId };

    let totalViews = 0;
    const byType: Record<string, number> = {};

    for (const uid of ALLOWED_CONTENT_TYPES) {
      const items = await strapi.db.query(uid).findMany({
        where: {
          author: authorFilter,
          publishedAt: { $notNull: true },
        },
        select: ['views'],
      });

      const views = items.reduce((sum: number, item: any) => sum + (typeof item.views === 'number' ? item.views : 0), 0);
      byType[uid] = views;
      totalViews += views;
    }

    ctx.body = { totalViews, byType };
  },
}));
