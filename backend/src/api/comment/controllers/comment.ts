import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { resolveUsersPermissionsUser } from '../../../utils/auth';

const { ApplicationError, ForbiddenError, NotFoundError, ValidationError } = errors;

const COMMENT_ALLOWED_ACCOUNT_TYPES = new Set(['subscriber', 'author', 'editor']);

function normalizeStopWord(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
}

function bodyContainsStopWord(
  body: string,
  stopWords?: Array<{ value?: string | null; matchMode?: 'contains' | 'exact' | null; enabled?: boolean | null }> | null,
) {
  const normalizedBody = normalizeStopWord(body);

  if (!normalizedBody || !stopWords?.length) {
    return false;
  }

  return stopWords.some((item) => {
    if (item?.enabled === false) {
      return false;
    }

    const needle = normalizeStopWord(item?.value);

    if (!needle) {
      return false;
    }

    if (item?.matchMode === 'exact') {
      return normalizedBody === needle;
    }

    return normalizedBody.includes(needle);
  });
}

async function resolveMemberProfile(strapi: any, userId?: number | null) {
  if (!userId) {
    return null;
  }

  return strapi.db.query('api::member-profile.member-profile').findOne({
    where: {
      user: userId,
    },
    select: ['id', 'accountType'],
  });
}

function hasCommentAccess(accountType?: string | null) {
  return Boolean(accountType && COMMENT_ALLOWED_ACCOUNT_TYPES.has(accountType));
}

export default factories.createCoreController('api::comment.comment' as any, ({ strapi }) => ({
  async find(ctx) {
    const { contentTypeUid, targetDocumentId } = ctx.request.query;

    const filters: Record<string, unknown> = {
      status: 'approved',
    };

    if (typeof contentTypeUid === 'string' && contentTypeUid.trim()) {
      filters.contentTypeUid = contentTypeUid.trim();
    }

    if (typeof targetDocumentId === 'string' && targetDocumentId.trim()) {
      filters.targetDocumentId = targetDocumentId.trim();
    }

    const comments = await strapi.db.query('api::comment.comment').findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      populate: {
        authorUser: {
          select: ['id', 'username'],
        },
      },
    });

    ctx.body = comments;
  },

  async findOne(ctx) {
    const id = Number(ctx.params.id);

    if (!Number.isInteger(id)) {
      throw new ValidationError('Некорректный идентификатор комментария.');
    }

    const comment = await strapi.db.query('api::comment.comment').findOne({
      where: { id, status: 'approved' },
      populate: {
        authorUser: {
          select: ['id', 'username'],
        },
      },
    });

    if (!comment) {
      throw new NotFoundError('Комментарий не найден.');
    }

    ctx.body = comment;
  },

  async create(ctx) {
    const payload = ctx.request.body?.data ?? ctx.request.body ?? {};
    const user =
      ctx.state.user ?? (await resolveUsersPermissionsUser(strapi, ctx.request.header?.authorization ?? null));
    const memberProfile = user ? await resolveMemberProfile(strapi, user.id) : null;
    const body = typeof payload.body === 'string' ? payload.body.trim() : '';
    const contentTypeUid = typeof payload.contentTypeUid === 'string' ? payload.contentTypeUid.trim() : '';
    const targetDocumentId = typeof payload.targetDocumentId === 'string' ? payload.targetDocumentId.trim() : '';
    const targetSlug = typeof payload.targetSlug === 'string' ? payload.targetSlug.trim() : null;
    const guestName = typeof payload.guestName === 'string' ? payload.guestName.trim() : null;
    const guestEmail = typeof payload.guestEmail === 'string' ? payload.guestEmail.trim().toLowerCase() : null;

    if (!body) {
      throw new ValidationError('Текст комментария обязателен.');
    }

    if (!contentTypeUid || !targetDocumentId) {
      throw new ValidationError('Не указана цель комментария.');
    }

    const communitySettings = await strapi.documents('api::community-setting.community-setting' as any).findFirst({
      populate: {
        commentStopWords: true,
      },
    } as any);

    if (!user) {
      throw new ForbiddenError('Оставлять комментарии могут только пользователи с ролью subscriber и выше.');
    }

    if (!hasCommentAccess(memberProfile?.accountType ?? null)) {
      throw new ForbiddenError('Оставлять комментарии могут только пользователи с ролью subscriber и выше.');
    }

    const maxLength = typeof communitySettings?.commentMaxLength === 'number' ? communitySettings.commentMaxLength : 3000;

    if (body.length > maxLength) {
      throw new ValidationError(`Комментарий не должен превышать ${maxLength} символов.`);
    }

    const containsStopWord = bodyContainsStopWord(body, communitySettings?.commentStopWords as any);

    if (containsStopWord) {
      throw new ApplicationError(
        communitySettings?.commentBlockedMessage?.trim() || 'Комментарий не может быть отправлен из-за запрещенных слов.',
      );
    }

    const comment = await strapi.db.query('api::comment.comment').create({
      data: {
        contentTypeUid,
        targetDocumentId,
        targetSlug,
        authorUser: user?.id ?? null,
        guestName: user ? null : guestName,
        guestEmail: user ? null : guestEmail,
        body,
        status: communitySettings?.commentModerationEnabled === false ? 'approved' : 'pending',
        containsStopWord: false,
        ipHash: null,
        userAgent: ctx.request.header['user-agent'] ?? null,
      },
    });

    ctx.body = comment;
  },
}));
