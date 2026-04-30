import type { Core } from '@strapi/strapi';

function extractBearerToken(headerValue: unknown) {
  if (typeof headerValue !== 'string') {
    return null;
  }

  const trimmed = headerValue.trim();

  if (!trimmed.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  const token = trimmed.slice(7).trim();
  return token || null;
}

async function resolveUsersPermissionsUserByToken(strapi: Core.Strapi, token: unknown) {
  if (typeof token !== 'string' || !token.trim()) {
    return null;
  }

  try {
    const jwtService = strapi.plugin('users-permissions').service('jwt');
    const jwtPayload = await jwtService.verify(token.trim());
    const userId = typeof jwtPayload?.id === 'number' ? jwtPayload.id : Number(jwtPayload?.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return null;
    }

    return strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: userId },
      populate: ['role'],
    });
  } catch {
    return null;
  }
}

export async function resolveUsersPermissionsUser(strapi: Core.Strapi, authorizationHeader: unknown) {
  const token = extractBearerToken(authorizationHeader);

  if (!token) {
    return null;
  }

  return resolveUsersPermissionsUserByToken(strapi, token);
}

export async function resolveUsersPermissionsUserFromCookie(strapi: Core.Strapi, jwtCookie: unknown) {
  return resolveUsersPermissionsUserByToken(strapi, jwtCookie);
}
