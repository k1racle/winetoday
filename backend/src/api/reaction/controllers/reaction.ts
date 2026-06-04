import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { resolveUsersPermissionsUser } from '../../../utils/auth';

const { ForbiddenError, ValidationError } = errors;

export default factories.createCoreController('api::reaction.reaction' as any, ({ strapi }) => ({
  async summary(ctx) {
    const contentTypeUid = typeof ctx.request.query.contentTypeUid === 'string' ? ctx.request.query.contentTypeUid.trim() : '';
    const targetDocumentId = typeof ctx.request.query.targetDocumentId === 'string' ? ctx.request.query.targetDocumentId.trim() : '';
    const guestId = typeof ctx.request.header?.['x-guest-id'] === 'string' ? ctx.request.header['x-guest-id'].trim() : '';
    const user =
      ctx.state.user ?? (await resolveUsersPermissionsUser(strapi, ctx.request.header?.authorization ?? null));

    if (!contentTypeUid || !targetDocumentId) {
      throw new ValidationError('Не указана цель реакции.');
    }

    const count = await strapi.db.query('api::reaction.reaction').count({
      where: {
        type: 'like',
        contentTypeUid,
        targetDocumentId,
      },
    });

    const disliked = Boolean(
      user || guestId
        ? await strapi.db.query('api::reaction.reaction').findOne({
            where: {
              type: 'dislike',
              contentTypeUid,
              targetDocumentId,
              ...(user ? { user: user.id } : { guestId }),
            },
          })
        : false,
    );

    const liked = user
      ? Boolean(
          await strapi.db.query('api::reaction.reaction').findOne({
            where: {
              type: 'like',
              contentTypeUid,
              targetDocumentId,
              ...(user ? { user: user.id } : guestId ? { guestId } : {}),
            },
          }),
        )
      : false;

    const guestLiked = !user && guestId
      ? Boolean(
          await strapi.db.query('api::reaction.reaction').findOne({
            where: {
              type: 'like',
              contentTypeUid,
              targetDocumentId,
              guestId,
            },
          }),
        )
      : false;

    ctx.body = {
      count,
      liked: user ? liked : guestLiked,
      disliked,
    };
  },

  async toggle(ctx) {
    const guestId = typeof ctx.request.header?.['x-guest-id'] === 'string' ? ctx.request.header['x-guest-id'].trim() : '';
    const user =
      ctx.state.user ?? (await resolveUsersPermissionsUser(strapi, ctx.request.header?.authorization ?? null));

    if (!user && !guestId) {
      throw new ForbiddenError('Не удалось определить пользователя для лайка.');
    }

    const payload = ctx.request.body?.data ?? ctx.request.body ?? {};
    const contentTypeUid = typeof payload.contentTypeUid === 'string' ? payload.contentTypeUid.trim() : '';
    const targetDocumentId = typeof payload.targetDocumentId === 'string' ? payload.targetDocumentId.trim() : '';
    const type = payload.type === 'dislike' ? 'dislike' : 'like';
    const oppositeType = type === 'like' ? 'dislike' : 'like';

    if (!contentTypeUid || !targetDocumentId) {
      throw new ValidationError('Не указана цель реакции.');
    }

    const existing = await strapi.db.query('api::reaction.reaction').findOne({
      where: {
        type,
        contentTypeUid,
        targetDocumentId,
        ...(user ? { user: user.id } : { guestId }),
      },
    });

    if (existing?.id) {
      await strapi.db.query('api::reaction.reaction').delete({
        where: { id: existing.id },
      });

      const count = await strapi.db.query('api::reaction.reaction').count({
        where: {
          type: 'like',
          contentTypeUid,
          targetDocumentId,
        },
      });

      ctx.body = { liked: false, disliked: false, count };
      return;
    }

    const oppositeReaction = await strapi.db.query('api::reaction.reaction').findOne({
      where: {
        type: oppositeType,
        contentTypeUid,
        targetDocumentId,
        ...(user ? { user: user.id } : { guestId }),
      },
    });

    if (oppositeReaction?.id) {
      await strapi.db.query('api::reaction.reaction').delete({
        where: { id: oppositeReaction.id },
      });
    }

    await strapi.db.query('api::reaction.reaction').create({
      data: {
        type,
        contentTypeUid,
        targetDocumentId,
        user: user?.id ?? null,
        guestId: user ? null : guestId,
      },
    });

    const count = await strapi.db.query('api::reaction.reaction').count({
      where: {
        type: 'like',
        contentTypeUid,
        targetDocumentId,
      },
    });

    ctx.body = { liked: type === 'like', disliked: type === 'dislike', count };
  },
}));
