import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ForbiddenError } = errors;

function resolveFrontendMode(accountType?: string | null) {
  if (accountType === 'editor') {
    return 'editor';
  }

  if (accountType === 'author') {
    return 'author';
  }

  return 'subscriber';
}

export default factories.createCoreController('api::member-profile.member-profile' as any, ({ strapi }) => ({
  async me(ctx) {
    const user = ctx.state.user ?? null;

    if (!user) {
      throw new ForbiddenError('Требуется авторизация.');
    }

    let profile = await strapi.db.query('api::member-profile.member-profile').findOne({
      where: {
        user: user.id,
      },
      populate: {
        avatar: true,
        author: true,
        user: true,
      },
    });

    if (!profile) {
      profile = await strapi.db.query('api::member-profile.member-profile').create({
        data: {
          user: user.id,
          displayName: user.username || user.email,
          accountType: 'subscriber',
        },
        populate: {
          avatar: true,
          author: true,
          user: true,
        },
      });
    }

    ctx.body = {
      id: user.id,
      username: user.username,
      email: user.email,
      mode: resolveFrontendMode(profile?.accountType ?? null),
      memberProfile: profile,
    };
  },

  async updateMe(ctx) {
    const user = ctx.state.user ?? null;

    if (!user) {
      throw new ForbiddenError('Требуется авторизация.');
    }

    const payload = ctx.request.body?.data ?? ctx.request.body ?? {};
    const profile = await strapi.db.query('api::member-profile.member-profile').findOne({
      where: { user: user.id },
    });

    const data = {
      displayName: typeof payload.displayName === 'string' ? payload.displayName.trim() : profile?.displayName ?? user.username ?? user.email,
      bio: typeof payload.bio === 'string' ? payload.bio.trim() : profile?.bio ?? null,
      accountType: profile?.accountType ?? 'subscriber',
    };

    const updated = profile?.id
      ? await strapi.db.query('api::member-profile.member-profile').update({
          where: { id: profile.id },
          data,
          populate: {
            avatar: true,
            author: true,
            user: true,
          },
        })
      : await strapi.db.query('api::member-profile.member-profile').create({
          data: {
            ...data,
            user: user.id,
            accountType: 'subscriber',
          },
          populate: {
            avatar: true,
            author: true,
            user: true,
          },
        });

    ctx.body = updated;
  },
}));
