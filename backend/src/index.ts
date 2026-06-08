import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { applyAutoSlug } from './utils/slug';

const FRONTEND_REVALIDATE_URL = process.env.FRONTEND_REVALIDATE_URL;
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;
const { ValidationError } = errors;
const CATEGORY_UID = 'api::category.category';

type AdminCredentials = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
};

function blocksParagraph(text: string) {
  return [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          text,
        },
      ],
    },
  ];
}

async function upsertSingleType(
  strapi: Core.Strapi,
  uid: string,
  data: Record<string, unknown>,
  syncIfExists = false,
) {
  const documents = strapi.documents(uid as any);
  const existing = await documents.findFirst();

  if (existing?.documentId) {
    if (syncIfExists) {
      return documents.update({
        documentId: existing.documentId,
        data,
        status: 'published',
      } as any);
    }

    return existing;
  }

  return documents.create({
    data,
    status: 'published',
  });
}

async function upsertBySlug(
  strapi: Core.Strapi,
  uid: string,
  slug: string,
  data: Record<string, unknown>,
  syncIfExists = false,
) {
  const documents = strapi.documents(uid as any);
  const existing = await documents.findFirst({
    filters: { slug },
  } as any);

  if (existing?.documentId) {
    if (syncIfExists) {
      return documents.update({
        documentId: existing.documentId,
        data: {
          ...data,
          slug,
        },
        status: 'published',
      } as any);
    }

    return existing;
  }

  return documents.create({
    data,
    status: 'published',
  });
}

async function ensurePublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) {
    return;
  }

  const actions = [
    'api::article.article.find',
    'api::article.article.findOne',
    'api::archive-setting.archive-setting.find',
    'api::archive-setting.archive-setting.findOne',
    'api::news.news.find',
    'api::news.news.findOne',
    'api::homepage.homepage.find',
    'api::homepage.homepage.findOne',
    'api::site-header.site-header.find',
    'api::site-header.site-header.findOne',
    'api::site-footer.site-footer.find',
    'api::site-footer.site-footer.findOne',
    'api::sidebar.sidebar.find',
    'api::sidebar.sidebar.findOne',
    'api::video.video.find',
    'api::video.video.findOne',
    'api::gallery.gallery.find',
    'api::gallery.gallery.findOne',
    'api::global-setting.global-setting.find',
    'api::global-setting.global-setting.findOne',
    'api::site-seo.site-seo.find',
    'api::site-seo.site-seo.findOne',
    'api::page.page.find',
    'api::page.page.findOne',
    'api::author.author.find',
    'api::author.author.findOne',
    'api::category.category.find',
    'api::category.category.findOne',
    'api::tag.tag.find',
    'api::tag.tag.findOne',
    'api::comment.comment.find',
    'api::comment.comment.findOne',
    'api::comment.comment.create',
    'api::community-setting.community-setting.find',
    'api::community-setting.community-setting.findOne',
    'api::social-auth-setting.social-auth-setting.find',
    'api::social-auth-setting.social-auth-setting.findOne',
    'api::reaction.reaction.summary',
    'api::reaction.reaction.toggle',
  ];

  const existingPermissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
    where: {
      role: { id: publicRole.id },
    },
  });

  const existingActions = new Set(existingPermissions.map((permission) => permission.action));

  for (const action of actions) {
    if (!existingActions.has(action)) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: {
          action,
          role: publicRole.id,
        },
      });
    }
  }
}

async function ensureRolePermissions(
  strapi: Core.Strapi,
  roleId: number,
  actions: string[],
) {
  const existingPermissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
    where: {
      role: { id: roleId },
    },
  });

  const existingActions = new Set(existingPermissions.map((permission) => permission.action));

  for (const action of actions) {
    if (!existingActions.has(action)) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: {
          action,
          role: roleId,
        },
      });
    }
  }
}

async function ensureEditorRole(strapi: Core.Strapi) {
  let editorRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'editor' },
  });

  if (!editorRole) {
    editorRole = await strapi.db.query('plugin::users-permissions.role').create({
      data: {
        name: 'Editor',
        description: 'Редактор frontend-кабинета',
        type: 'editor',
      },
    });
  }

  await ensureRolePermissions(strapi, editorRole.id, [
    'api::article.article.find',
    'api::article.article.findOne',
    'api::article.article.create',
    'api::article.article.update',
    'api::news.news.find',
    'api::news.news.findOne',
    'api::news.news.create',
    'api::news.news.update',
    'api::video.video.find',
    'api::video.video.findOne',
    'api::video.video.create',
    'api::video.video.update',
    'plugin::upload.content-api.find',
    'plugin::upload.content-api.findOne',
    'plugin::upload.content-api.upload',
    'api::member-profile.member-profile.me',
    'api::member-profile.member-profile.updateMe',
    'api::member-profile.member-profile.find',
    'api::member-profile.member-profile.findOne',
    'api::editor.editor.session',
    'api::editor.editor.list',
    'api::editor.editor.findOne',
    'api::editor.editor.authors',
    'api::editor.editor.categories',
    'api::editor.editor.tags',
    'api::editor.editor.media',
    'api::editor.editor.upload',
    'api::editor.editor.save',
    'api::editor.editor.delete',
  ]);

  return editorRole;
}

async function syncLegacyEditorRolesToProfiles(strapi: Core.Strapi) {
  const editorRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'editor' },
  });

  if (!editorRole?.id) {
    return;
  }

  const editorUsers = await strapi.db.query('plugin::users-permissions.user').findMany({
    where: {
      role: {
        id: editorRole.id,
      },
    },
    populate: ['role'],
  });

  for (const user of editorUsers) {
    const existingProfile = await strapi.db.query('api::member-profile.member-profile').findOne({
      where: {
        user: user.id,
      },
    });

    if (existingProfile?.id) {
      if (existingProfile.accountType !== 'editor') {
        await strapi.db.query('api::member-profile.member-profile').update({
          where: { id: existingProfile.id },
          data: {
            accountType: 'editor',
          },
        });
      }

      continue;
    }

    await strapi.db.query('api::member-profile.member-profile').create({
      data: {
        user: user.id,
        displayName: user.username || user.email,
        accountType: 'editor',
      },
    });
  }
}

async function ensureAuthenticatedPermissions(strapi: Core.Strapi) {
  const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' },
  });

  if (!authenticatedRole) {
    return;
  }

  await ensureRolePermissions(strapi, authenticatedRole.id, [
    'api::member-profile.member-profile.me',
    'api::member-profile.member-profile.updateMe',
    'api::comment.comment.find',
    'api::comment.comment.findOne',
    'api::comment.comment.create',
    'api::editor.editor.session',
    'api::editor.editor.list',
    'api::editor.editor.findOne',
    'api::editor.editor.authors',
    'api::editor.editor.categories',
    'api::editor.editor.tags',
    'api::editor.editor.media',
    'api::editor.editor.upload',
    'api::editor.editor.save',
    'api::editor.editor.delete',
    'api::reaction.reaction.summary',
    'api::reaction.reaction.toggle',
  ]);
}

async function ensureUsersPermissionsProviders(strapi: Core.Strapi) {
  const socialAuthSettings = await strapi.documents('api::social-auth-setting.social-auth-setting' as any).findFirst();
  const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
  const currentGrant = ((await pluginStore.get({ key: 'grant' })) as Record<string, any> | null) ?? {};
  const publicServerUrl = strapi.config.get('server.url') as string;
  const apiPrefix = strapi.config.get('api.rest.prefix') as string;
  const authBaseUrl = `${publicServerUrl.replace(/\/$/, '')}${apiPrefix}/auth`;

  const googleClientId = socialAuthSettings?.googleClientId?.trim() || process.env.GOOGLE_CLIENT_ID || '';
  const googleClientSecret = socialAuthSettings?.googleClientSecret?.trim() || process.env.GOOGLE_CLIENT_SECRET || '';
  const googleScope = socialAuthSettings?.googleScope
    ?.split(/[\s,]+/)
    .map((item: string) => item.trim())
    .filter(Boolean) ?? ['email'];

  const vkClientId = socialAuthSettings?.vkClientId?.trim() || process.env.VK_CLIENT_ID || '';
  const vkClientSecret = socialAuthSettings?.vkClientSecret?.trim() || process.env.VK_CLIENT_SECRET || '';
  const vkScope = socialAuthSettings?.vkScope
    ?.split(/[\s,]+/)
    .map((item: string) => item.trim())
    .filter(Boolean) ?? ['email'];

  const nextGrant = {
    ...currentGrant,
    email: {
      ...(currentGrant.email ?? {}),
      enabled: true,
    },
    google: {
      ...(currentGrant.google ?? {}),
      enabled: Boolean(socialAuthSettings?.googleEnabled && googleClientId && googleClientSecret),
      key: googleClientId || currentGrant.google?.key || '',
      secret: googleClientSecret || currentGrant.google?.secret || '',
      callback: `${authBaseUrl}/google/callback`,
      callbackUrl: `${authBaseUrl}/google/callback`,
      scope: googleScope.length ? googleScope : ['email'],
    },
    vk: {
      ...(currentGrant.vk ?? {}),
      enabled: Boolean(socialAuthSettings?.vkEnabled && vkClientId && vkClientSecret),
      key: vkClientId || currentGrant.vk?.key || '',
      secret: vkClientSecret || currentGrant.vk?.secret || '',
      callback: `${authBaseUrl}/vk/callback`,
      callbackUrl: `${authBaseUrl}/vk/callback`,
      scope: vkScope.length ? vkScope : ['email'],
    },
  };

  await pluginStore.set({ key: 'grant', value: nextGrant });
}

async function ensureUploadSettings(strapi: Core.Strapi) {
  const settingsStore = strapi.store({
    type: 'plugin',
    name: 'upload',
    key: 'settings',
  });

  const currentSettings = ((await settingsStore.get({})) as Record<string, unknown> | null) ?? {};

  if (currentSettings.autoOrientation === true) {
    return;
  }

  await settingsStore.set({
    value: {
      ...currentSettings,
      autoOrientation: true,
    },
  });
}

function getAdminCredentials(): AdminCredentials | null {
  const firstname = process.env.STRAPI_ADMIN_FIRSTNAME?.trim() ?? '';
  const lastname = process.env.STRAPI_ADMIN_LASTNAME?.trim() ?? '';
  const email = process.env.STRAPI_ADMIN_EMAIL?.trim().toLowerCase() ?? '';
  const password = process.env.STRAPI_ADMIN_PASSWORD?.trim() ?? '';

  if (!firstname || !lastname || !email || !password) {
    return null;
  }

  return {
    firstname,
    lastname,
    email,
    password,
  };
}

async function ensureAdminUser(strapi: Core.Strapi) {
  const credentials = getAdminCredentials();

  if (!credentials) {
    strapi.log.warn(
      'STRAPI_ADMIN_FIRSTNAME, STRAPI_ADMIN_LASTNAME, STRAPI_ADMIN_EMAIL or STRAPI_ADMIN_PASSWORD are not fully configured. Automatic administrator creation skipped.',
    );
    return;
  }

  const existingAdmin = await strapi.db.query('admin::user').findOne({
    where: { email: credentials.email },
    populate: ['roles'],
  });

  if (existingAdmin) {
    strapi.log.info(`Administrator ${credentials.email} already exists.`);
    return;
  }

  const superAdminRole = await strapi.service('admin::role').getSuperAdmin();

  if (!superAdminRole) {
    strapi.log.warn('Super Admin role is not available yet. Automatic administrator creation skipped.');
    return;
  }

  await strapi.service('admin::user').create({
    ...credentials,
    isActive: true,
    roles: [superAdminRole.id],
  });

  strapi.log.info(`Administrator ${credentials.email} created successfully.`);
}

type RevalidateTarget = {
  uid: string;
  slug?: string | null;
  tags?: unknown;
};

function normalizeRevalidateTags(tags: unknown): Array<{ slug?: string | null }> {
  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is { slug?: string | null } => Boolean(tag && typeof tag === 'object'));
  }

  if (typeof tags !== 'object') {
    return [];
  }

  const relationPayload = tags as {
    set?: unknown;
    connect?: unknown;
    disconnect?: unknown;
    slug?: string | null;
  };

  const nestedCollections = [relationPayload.set, relationPayload.connect, relationPayload.disconnect];

  for (const collection of nestedCollections) {
    if (Array.isArray(collection)) {
      return collection.filter((tag): tag is { slug?: string | null } => Boolean(tag && typeof tag === 'object'));
    }
  }

  if ('slug' in relationPayload) {
    return [relationPayload];
  }

  return [];
}

function buildRevalidatePaths(target: RevalidateTarget): string[] {
  const paths = new Set<string>(['/', '/articles', '/news', '/videos']);

  switch (target.uid) {
    case 'api::homepage.homepage':
    case 'api::site-header.site-header':
    case 'api::site-footer.site-footer':
    case 'api::global-setting.global-setting':
    case 'api::site-seo.site-seo':
      paths.add('/');
      break;
    case 'api::article.article':
      paths.add('/articles');
      if (target.slug) {
        paths.add(`/articles/${target.slug}`);
      }
      break;
    case 'api::news.news':
      paths.add('/news');
      if (target.slug) {
        paths.add(`/news/${target.slug}`);
      }
      break;
    case 'api::video.video':
      paths.add('/videos');
      if (target.slug) {
        paths.add(`/videos/${target.slug}`);
      }
      break;
    case 'api::page.page':
      if (target.slug) {
        paths.add(`/${target.slug}`);
      }
      break;
    case 'api::tag.tag':
      if (target.slug) {
        paths.add(`/tags/${target.slug}`);
      }
      break;
    case 'api::sidebar.sidebar':
      paths.add('/');
      paths.add('/articles');
      paths.add('/news');
      paths.add('/videos');
      break;
    default:
      break;
  }

  for (const tag of normalizeRevalidateTags(target.tags)) {
    if (tag.slug) {
      paths.add(`/tags/${tag.slug}`);
    }
  }

  return Array.from(paths);
}

async function requestFrontendRevalidation(strapi: Core.Strapi, target: RevalidateTarget) {
  if (!FRONTEND_REVALIDATE_URL || !REVALIDATE_SECRET) {
    return;
  }

  const paths = buildRevalidatePaths(target);

  try {
    const response = await fetch(FRONTEND_REVALIDATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: REVALIDATE_SECRET,
        paths,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      strapi.log.warn(`Frontend revalidation failed for ${target.uid}: ${response.status} ${body}`);
    }
  } catch (error) {
    strapi.log.warn(`Frontend revalidation request failed for ${target.uid}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function extractEntryPayload(event: any) {
  return event.result ?? event.params?.data ?? null;
}

function extractDocumentIdFromWhere(where: unknown) {
  if (!where || typeof where !== 'object') {
    return null;
  }

  const maybeWhere = where as { documentId?: unknown };
  return typeof maybeWhere.documentId === 'string' ? maybeWhere.documentId : null;
}

async function findCategoryByIdentifier(strapi: Core.Strapi, value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return strapi.documents(CATEGORY_UID as any).findFirst({
      filters: { documentId: value.trim() },
      fields: ['documentId'],
      populate: {
        parent: {
          fields: ['documentId'],
        },
      },
    } as any);
  }

  if (typeof value === 'number' && Number.isInteger(value)) {
    return strapi.db.query(CATEGORY_UID).findOne({
      where: { id: value },
      select: ['documentId'],
      populate: {
        parent: {
          select: ['documentId'],
        },
      },
    });
  }

  return null;
}

async function extractRelationDocumentId(strapi: Core.Strapi, relationValue: unknown): Promise<string | null | undefined> {
  if (relationValue === undefined) {
    return undefined;
  }

  if (relationValue === null) {
    return null;
  }

  if (typeof relationValue === 'string' || typeof relationValue === 'number') {
    const relation = await findCategoryByIdentifier(strapi, relationValue);
    return relation?.documentId ?? null;
  }

  if (typeof relationValue !== 'object') {
    return null;
  }

  const payload = relationValue as {
    documentId?: unknown;
    id?: unknown;
    connect?: unknown;
    set?: unknown;
    disconnect?: unknown;
  };

  if (typeof payload.documentId === 'string' && payload.documentId.trim()) {
    return payload.documentId.trim();
  }

  if (typeof payload.id === 'number' && Number.isInteger(payload.id)) {
    const relation = await findCategoryByIdentifier(strapi, payload.id);
    return relation?.documentId ?? null;
  }

  const nestedValue = payload.set ?? payload.connect ?? payload.disconnect;

  if (Array.isArray(nestedValue)) {
    const firstItem = nestedValue[0];
    return firstItem === undefined ? null : extractRelationDocumentId(strapi, firstItem);
  }

  if (nestedValue !== undefined) {
    return extractRelationDocumentId(strapi, nestedValue);
  }

  return null;
}

async function extractRelationDocumentIds(strapi: Core.Strapi, relationValue: unknown): Promise<string[] | undefined> {
  if (relationValue === undefined) {
    return undefined;
  }

  if (relationValue === null) {
    return [];
  }

  if (Array.isArray(relationValue)) {
    const ids = await Promise.all(relationValue.map((item) => extractRelationDocumentId(strapi, item)));
    return ids.filter((item): item is string => typeof item === 'string');
  }

  if (typeof relationValue !== 'object') {
    const relationId = await extractRelationDocumentId(strapi, relationValue);
    return relationId ? [relationId] : [];
  }

  const payload = relationValue as {
    set?: unknown;
    connect?: unknown;
  };

  const nestedValue = payload.set ?? payload.connect;

  if (nestedValue === undefined) {
    return [];
  }

  return extractRelationDocumentIds(strapi, nestedValue);
}

async function findCategoryByDocumentId(strapi: Core.Strapi, documentId?: string | null) {
  if (!documentId) {
    return null;
  }

  return strapi.documents(CATEGORY_UID as any).findFirst({
    filters: { documentId },
    fields: ['documentId', 'name'],
    populate: {
      parent: {
        fields: ['documentId', 'name'],
      },
    },
  } as any);
}

async function syncAuthorRelations(strapi: Core.Strapi) {
  const profiles = await strapi.db.query('api::member-profile.member-profile').findMany({
    where: {
      accountType: 'author',
    },
    populate: {
      author: true,
      user: true,
    },
  });

  for (const profile of profiles) {
    const displayName = typeof profile?.displayName === 'string' ? profile.displayName.trim() : '';

    if (!profile?.id || !displayName) {
      continue;
    }

    let author = null as any;

    if (profile.author?.id) {
      author = await strapi.db.query('api::author.author').findOne({
        where: { id: profile.author.id },
        populate: {
          memberProfile: true,
        },
      });
    }

    if (!author && typeof profile.authorSlug === 'string' && profile.authorSlug.trim()) {
      author = await strapi.documents('api::author.author' as any).findFirst({
        filters: { slug: profile.authorSlug.trim() },
        fields: ['name', 'slug'],
        populate: {
          memberProfile: true,
        },
      } as any);
    }

    if (!author) {
      author = await strapi.documents('api::author.author' as any).findFirst({
        filters: {
          name: {
            $eqi: displayName,
          },
        },
        fields: ['name', 'slug'],
        populate: {
          memberProfile: true,
        },
      } as any);
    }

    if (!author) {
      author = await strapi.documents('api::author.author' as any).create({
        data: {
          name: displayName,
          memberProfile: profile.id,
        },
      } as any);
    }

    const nextSlug = typeof author?.slug === 'string' ? author.slug.trim() : '';
    const authorId = Number(author?.id);

    if (!Number.isInteger(authorId) || authorId <= 0) {
      continue;
    }

    await strapi.db.query('api::member-profile.member-profile').update({
      where: { id: profile.id },
      data: {
        author: authorId,
        authorSlug: nextSlug || profile.authorSlug || null,
      },
    });

    if (author.memberProfile?.id !== profile.id) {
      await strapi.db.query('api::author.author').update({
        where: { id: authorId },
        data: {
          memberProfile: profile.id,
        },
      });
    }
  }
}

async function assertCategoryHierarchyIsValid(strapi: Core.Strapi, event: any) {
  if (event.model?.uid !== CATEGORY_UID) {
    return;
  }

  const currentDocumentId = extractDocumentIdFromWhere(event.params?.where);
  const data = event.params?.data as Record<string, unknown> | undefined;

  if (!data) {
    return;
  }

  const existingCategory = currentDocumentId
    ? await findCategoryByDocumentId(strapi, currentDocumentId)
    : null;

  const nextParentDocumentId = Object.prototype.hasOwnProperty.call(data, 'parent')
    ? await extractRelationDocumentId(strapi, data.parent)
    : existingCategory?.parent?.documentId ?? undefined;

  if (currentDocumentId && nextParentDocumentId === currentDocumentId) {
    throw new ValidationError('Категория не может быть родительской сама для себя.');
  }

  if (currentDocumentId && nextParentDocumentId) {
    const visited = new Set<string>();
    let cursorDocumentId: string | null = nextParentDocumentId;

    while (cursorDocumentId && !visited.has(cursorDocumentId)) {
      if (cursorDocumentId === currentDocumentId) {
        throw new ValidationError('Нельзя сохранить категорию: выбранный родитель создает циклическую иерархию.');
      }

      visited.add(cursorDocumentId);
      const cursorCategory = await findCategoryByDocumentId(strapi, cursorDocumentId);
      cursorDocumentId = cursorCategory?.parent?.documentId ?? null;
    }
  }

  const nextChildrenDocumentIds = Object.prototype.hasOwnProperty.call(data, 'children')
    ? await extractRelationDocumentIds(strapi, data.children)
    : undefined;

  if (!nextChildrenDocumentIds?.length) {
    return;
  }

  const uniqueChildrenDocumentIds = Array.from(new Set(nextChildrenDocumentIds));

  if (currentDocumentId && uniqueChildrenDocumentIds.includes(currentDocumentId)) {
    throw new ValidationError('Категория не может быть дочерней сама для себя.');
  }

  if (nextParentDocumentId && uniqueChildrenDocumentIds.includes(nextParentDocumentId)) {
    throw new ValidationError('Нельзя одновременно выбрать одну и ту же категорию как родительскую и дочернюю.');
  }

  if (!currentDocumentId) {
    return;
  }

  const ancestorDocumentIds = new Set<string>();
  let ancestorDocumentId = existingCategory?.parent?.documentId ?? null;

  while (ancestorDocumentId && !ancestorDocumentIds.has(ancestorDocumentId)) {
    ancestorDocumentIds.add(ancestorDocumentId);
    const ancestorCategory = await findCategoryByDocumentId(strapi, ancestorDocumentId);
    ancestorDocumentId = ancestorCategory?.parent?.documentId ?? null;
  }

  for (const childDocumentId of uniqueChildrenDocumentIds) {
    if (ancestorDocumentIds.has(childDocumentId)) {
      throw new ValidationError('Нельзя назначить предка дочерней категорией: это создаст цикл.');
    }
  }
}

function registerRevalidationHooks(strapi: Core.Strapi) {
  const observedUids = [
    'api::homepage.homepage',
    'api::site-header.site-header',
    'api::site-footer.site-footer',
    'api::global-setting.global-setting',
    'api::site-seo.site-seo',
    'api::article.article',
    'api::news.news',
    'api::video.video',
    'api::page.page',
    'api::tag.tag',
    'api::sidebar.sidebar',
  ];

  strapi.db.lifecycles.subscribe({
    models: observedUids,
    async afterCreate(event) {
      const entry = extractEntryPayload(event);
      await requestFrontendRevalidation(strapi, {
        uid: event.model.uid,
        slug: entry?.slug ?? null,
        tags: entry?.tags ?? null,
      });
    },
    async afterUpdate(event) {
      const entry = extractEntryPayload(event);
      await requestFrontendRevalidation(strapi, {
        uid: event.model.uid,
        slug: entry?.slug ?? null,
        tags: entry?.tags ?? null,
      });
    },
    async afterDelete(event) {
      const entry = extractEntryPayload(event);
      await requestFrontendRevalidation(strapi, {
        uid: event.model.uid,
        slug: entry?.slug ?? null,
        tags: entry?.tags ?? null,
      });
    },
  });
}

function registerAutoSlugHooks(strapi: Core.Strapi) {
  strapi.db.lifecycles.subscribe({
    models: [
      'api::article.article',
      'api::news.news',
      'api::video.video',
      'api::gallery.gallery',
      'api::page.page',
      'api::category.category',
      'api::tag.tag',
      'api::author.author',
      'api::sidebar.sidebar',
    ],
    async beforeCreate(event) {
      event.state = {
        ...(event.state ?? {}),
        strapi,
        autoSlugOperation: 'create',
      };
      await applyAutoSlug(event);
    },
    async beforeUpdate(event) {
      event.state = {
        ...(event.state ?? {}),
        strapi,
        autoSlugOperation: 'update',
      };
      await applyAutoSlug(event);
    },
  });
}

function registerCategoryHierarchyValidation(strapi: Core.Strapi) {
  strapi.db.lifecycles.subscribe({
    models: [CATEGORY_UID],
    async beforeCreate(event) {
      await assertCategoryHierarchyIsValid(strapi, event);
    },
    async beforeUpdate(event) {
      await assertCategoryHierarchyIsValid(strapi, event);
    },
  });
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.customFields.register({
      name: 'color',
      type: 'string',
      inputSize: {
        default: 4,
        isResizable: true,
      },
    });
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureAdminUser(strapi);
    await ensurePublicPermissions(strapi);
    await ensureEditorRole(strapi);
    await syncLegacyEditorRolesToProfiles(strapi);
    await ensureAuthenticatedPermissions(strapi);
    await ensureUsersPermissionsProviders(strapi);
    await ensureUploadSettings(strapi);
    await syncAuthorRelations(strapi);
    registerAutoSlugHooks(strapi);
    registerCategoryHierarchyValidation(strapi);
    registerRevalidationHooks(strapi);

    await upsertSingleType(strapi, 'api::global-setting.global-setting', {
      siteName: 'Виноделие сегодня',
      siteDescription: 'Русскоязычный портал о винных регионах, людях отрасли, аналитике и событиях современного виноделия.',
      tickerText:
        'Следим за российским виноделием, новыми релизами хозяйств, фестивалями, дегустациями и развитием энотуризма.',
      typography: {
        menu: {
          fontFamily: 'inter',
          fontSize: '14px',
        },
        body: {
          fontFamily: 'inter',
          fontSize: '16px',
        },
        h1: {
          fontFamily: 'oswald',
          fontSize: '56px',
        },
        h2: {
          fontFamily: 'oswald',
          fontSize: '32px',
        },
        h3: {
          fontFamily: 'oswald',
          fontSize: '24px',
        },
        h4: {
          fontFamily: 'oswald',
          fontSize: '20px',
        },
        small: {
          fontFamily: 'inter',
          fontSize: '14px',
        },
        caption: {
          fontFamily: 'inter',
          fontSize: '12px',
        },
        button: {
          fontFamily: 'inter',
          fontSize: '14px',
        },
      },
      });

    await upsertSingleType(strapi, 'api::site-seo.site-seo', {
      siteUrl: process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://127.0.0.1',
      defaultSeo: {
        metaTitle: 'Виноделие сегодня',
        metaDescription: 'Новости, статьи, события и видео о современном виноделии на русском языке.',
        keywords: 'виноделие, вино, российское вино, винные регионы, события, дегустации',
      },
      robotsEnabled: true,
      robotsRules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: '/admin/',
        },
      ],
      sitemapEnabled: true,
      sitemapIncludeArticles: true,
      sitemapIncludeNews: true,
      sitemapIncludeVideos: true,
      sitemapIncludePages: true,
    });

    await upsertSingleType(strapi, 'api::site-footer.site-footer', {
      bottomBarText: '2026 Виноделие сегодня. Все права защищены.',
      backgroundColor: '#0b140d',
      textColor: '#ffffff',
      bottomBarBackgroundColor: '#111111',
      bottomBarTextColor: '#ffffff',
      column1: {
        title: 'Виноделие сегодня',
        items: [
          {
            kind: 'text',
            text: 'Редакционный портал о современной винной индустрии: аналитика, регионы, события, интервью и отраслевые новости.',
          },
        ],
      },
      column2: {
        title: 'Разделы',
        items: [
          { kind: 'link', label: 'Главная', href: '/' },
          { kind: 'link', label: 'Статьи', href: '/articles' },
          { kind: 'link', label: 'Новости', href: '/news' },
          { kind: 'link', label: 'Видео', href: '/videos' },
        ],
      },
      column3: {
        title: 'Редакция',
        items: [
          { kind: 'link', label: 'О проекте', href: '/o-proekte' },
          { kind: 'link', label: 'Контакты редакции', href: '/kontakty-redaktsii' },
        ],
      },
      column4: {
        title: 'Контакты',
        items: [
          { kind: 'email', text: 'editor@vinotoday.local' },
          { kind: 'phone', text: '+7 (900) 555-21-21' },
          { kind: 'address', text: 'Москва, Россия' },
          { kind: 'link', label: 'Кабинет автора и редактора', href: '/account' },
        ],
      },
    });

    await upsertSingleType(strapi, 'api::archive-setting.archive-setting', {
      enableCardEffects: true,
    });

    await upsertSingleType(strapi, 'api::community-setting.community-setting', {
      allowGuestComments: false,
      commentModerationEnabled: true,
      commentBlockedMessage: 'Комментарий не может быть отправлен из-за запрещенных слов.',
      commentMaxLength: 3000,
      commentStopWords: [],
      shareNetworks: [
        {
          label: 'VK',
          networkKey: 'vk',
          shareUrlTemplate: 'https://vk.com/share.php?url={url}',
          enabled: true,
        },
        {
          label: 'Telegram',
          networkKey: 'telegram',
          shareUrlTemplate: 'https://t.me/share/url?url={url}&text={title}',
          enabled: true,
        },
      ],
    });

    await upsertSingleType(strapi, 'api::social-auth-setting.social-auth-setting', {
      googleEnabled: false,
      googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      googleScope: 'email',
      vkEnabled: false,
      vkClientId: process.env.VK_CLIENT_ID ?? '',
      vkClientSecret: process.env.VK_CLIENT_SECRET ?? '',
      vkScope: 'email',
    });

    await upsertBySlug(strapi, 'api::sidebar.sidebar', 'glavnaya-navigator-redaktsii', {
      title: 'Навигатор редакции на главной',
      slug: 'glavnaya-navigator-redaktsii',
      description: 'Быстрый доступ к ключевым разделам, редакционным страницам и важным сценариям для читателя.',
      paths: [{ path: '/', exactMatch: true }],
      links: [
        {
          label: 'О проекте',
          href: '/o-proekte',
          description: 'Кто мы и зачем делаем этот портал о винной индустрии.',
        },
        {
          label: 'Контакты редакции',
          href: '/kontakty-redaktsii',
          description: 'Инфоповоды, партнерства и связь с редакцией.',
        },
        {
          label: 'Главные статьи',
          href: '/articles',
          description: 'Аналитика, регионы, интервью и большие редакционные материалы.',
        },
      ],
      sections: [
        {
          title: 'Редакция',
          description: 'Сценарии быстрого доступа к ключевым страницам проекта.',
          links: [
            { label: 'О проекте', href: '/o-proekte' },
            { label: 'Контакты редакции', href: '/kontakty-redaktsii' },
          ],
        },
        {
          title: 'Контент',
          links: [
            { label: 'Главные статьи', href: '/articles' },
            { label: 'Лента новостей', href: '/news' },
            { label: 'Видео', href: '/videos' },
          ],
        },
      ],
    });

    await upsertSingleType(strapi, 'api::homepage.homepage', {
      title: 'Виноделие сегодня',
      description: 'Современный русскоязычный портал о мире вина, регионах, аналитике и людях отрасли.',
      infographicTitle: 'Инфографика отрасли',
      infographicDescription: 'Крупный полноширинный инфографический блок с карточками разных форм, ссылками и фоновыми изображениями редактируется прямо из CMS.',
      infographicCardsDesktop: [
        {
          shape: 'rectangle',
          title: '900 га',
          description: 'Планируют заложить в Крыму в 2026 году',
          href: '/news',
          accentText: 'Виноградники',
          theme: 'dark',
        },
        {
          shape: 'square',
          title: 'ZERO',
          description: 'Кто первый на Кубани выпустит безалкогольное вино',
          href: '/articles',
          theme: 'light',
        },
        {
          shape: 'rectangle',
          title: '>34%',
          description: 'годовой рост продаж Российских тихих вин',
          href: '/news',
          theme: 'light',
        },
        {
          shape: 'rectangle',
          title: '<18%',
          description: 'снизилась производительность вина в России',
          href: '/news',
          theme: 'dark',
        },
        {
          shape: 'square',
          title: '400 ₽',
          description: 'за бутылку хорошего вина: обсуждаем заявление Роскачества',
          href: '/articles',
          theme: 'light',
        },
        {
          shape: 'square',
          title: 'Вино в bag-in-box',
          description: 'за и против: комментарии экспертов',
          href: '/articles',
          theme: 'dark',
        },
        {
          shape: 'circle',
          title: 'Фокус',
          description: 'Главная тема недели, визуальный акцент и переход к материалу.',
          href: '/news',
          theme: 'dark',
        },
        {
          shape: 'square',
          title: '200 км²',
          description: 'Новые границы на винодельческой карте России',
          href: '/articles',
          accentText: 'Карта',
          theme: 'light',
        },
      ],
      infographicCardsTablet: [
        {
          shape: 'rectangle',
          title: '900 га',
          description: 'Планируют заложить в Крыму в 2026 году',
          href: '/news',
          accentText: 'Виноградники',
          theme: 'dark',
        },
        {
          shape: 'square',
          title: 'ZERO',
          description: 'Кто первый на Кубани выпустит безалкогольное вино',
          href: '/articles',
          theme: 'light',
        },
        {
          shape: 'rectangle',
          title: '>34%',
          description: 'годовой рост продаж Российских тихих вин',
          href: '/news',
          theme: 'light',
        },
        {
          shape: 'rectangle',
          title: '<18%',
          description: 'снизилась производительность вина в России',
          href: '/news',
          theme: 'dark',
        },
        {
          shape: 'square',
          title: 'Вино в bag-in-box',
          description: 'за и против: комментарии экспертов',
          href: '/articles',
          theme: 'dark',
        },
        {
          shape: 'circle',
          title: 'Фокус',
          description: 'Главная тема недели, визуальный акцент и переход к материалу.',
          href: '/news',
          theme: 'dark',
        },
      ],
      infographicCardsMobile: [
        {
          shape: 'rectangle',
          title: '900 га',
          description: 'Планируют заложить в Крыму в 2026 году',
          href: '/news',
          accentText: 'Виноградники',
          theme: 'dark',
        },
        {
          shape: 'square',
          title: 'ZERO',
          description: 'Кто первый на Кубани выпустит безалкогольное вино',
          href: '/articles',
          theme: 'light',
        },
        {
          shape: 'rectangle',
          title: '>34%',
          description: 'годовой рост продаж Российских тихих вин',
          href: '/news',
          theme: 'light',
        },
        {
          shape: 'rectangle',
          title: '<18%',
          description: 'снизилась производительность вина в России',
          href: '/news',
          theme: 'dark',
        },
        {
          shape: 'square',
          title: 'Вино в bag-in-box',
          description: 'за и против: комментарии экспертов',
          href: '/articles',
          theme: 'dark',
        },
        {
          shape: 'circle',
          title: 'Фокус',
          description: 'Главная тема недели, визуальный акцент и переход к материалу.',
          href: '/news',
          theme: 'dark',
        },
        {
          shape: 'square',
          title: '200 км²',
          description: 'Новые границы на винодельческой карте России',
          href: '/articles',
          accentText: 'Карта',
          theme: 'light',
        },
      ],
      infographicCards: [
        {
          shape: 'rectangle',
          title: '900 га',
          description: 'Планируют заложить в Крыму в 2026 году',
          href: '/news',
          accentText: 'Виноградники',
          theme: 'dark',
        },
        {
          shape: 'square',
          title: 'ZERO',
          description: 'Кто первый на Кубани выпустит безалкогольное вино',
          href: '/articles',
          theme: 'light',
        },
        {
          shape: 'rectangle',
          title: '>34%',
          description: 'годовой рост продаж Российских тихих вин',
          href: '/news',
          theme: 'light',
        },
        {
          shape: 'rectangle',
          title: '<18%',
          description: 'снизилась производительность вина в России',
          href: '/news',
          theme: 'dark',
        },
        {
          shape: 'square',
          title: '400 ₽',
          description: 'за бутылку хорошего вина: обсуждаем заявление Роскачества',
          href: '/articles',
          theme: 'light',
        },
        {
          shape: 'square',
          title: 'Вино в bag-in-box',
          description: 'за и против: комментарии экспертов',
          href: '/articles',
          theme: 'dark',
        },
        {
          shape: 'circle',
          title: 'Фокус',
          description: 'Главная тема недели, визуальный акцент и переход к материалу.',
          href: '/news',
          theme: 'dark',
        },
        {
          shape: 'square',
          title: '200 км²',
          description: 'Новые границы на винодельческой карте России',
          href: '/articles',
          accentText: 'Карта',
          theme: 'light',
        },
        {
          shape: 'square',
          title: '12 регионов',
          description: 'Где сильнее всего растет интерес к локальному вину',
          href: '/news',
          theme: 'dark',
        },
        {
          shape: 'square',
          title: '78%',
          description: 'Доля читателей, которые выбирают новости и аналитику о российском вине',
          href: '/articles',
          theme: 'light',
        },
      ],
      blocks: [
        {
          __component: 'blocks.link-grid',
          title: 'Что читать и смотреть на старте',
          description: 'Главная страница редактируется в CMS как самостоятельный редакционный лендинг из переиспользуемых блоков.',
          links: [
            {
              label: 'Статьи',
              href: '/articles',
              description: 'Лонгриды, аналитика, интервью и материалы по регионам.',
            },
            {
              label: 'Новости',
              href: '/news',
              description: 'Оперативная лента индустрии и анонсов.',
            },
            {
              label: 'Видео',
              href: '/videos',
              description: 'Интервью, репортажи и визуальные истории о винной индустрии.',
            },
          ],
        },
      ],
      seo: {
        metaTitle: 'Виноделие сегодня',
        metaDescription: 'Главная страница портала Виноделие сегодня: новости, статьи и видео о современной винной индустрии.',
        keywords: 'виноделие, вино, российское вино, новости виноделия, аналитика, видео',
      },
    });

    await upsertBySlug(strapi, 'api::page.page', 'o-proekte', {
      title: 'О проекте',
      slug: 'o-proekte',
      excerpt: 'Редакционная страница о миссии портала, фокусе контента и принципах отбора материалов.',
      showInFooter: true,
      content: [
        {
          __component: 'blocks.hero',
          eyebrow: 'Редакционный манифест',
          title: 'Портал о винной индустрии, который помогает видеть контекст, а не только заголовки',
          description:
            'Мы собираем русскоязычную повестку о винах, регионах, людях отрасли, событиях и рынке так, чтобы материалами было удобно пользоваться и профессионалам, и увлечённым читателям.',
          theme: 'dark',
        },
        {
          __component: 'blocks.rich-text',
          title: 'Что такое Виноделие сегодня',
          content: blocksParagraph('Это русскоязычный редакционный портал о современной винной индустрии: регионах, людях отрасли, рыночных изменениях, фестивалях, дегустациях и развитии энотуризма.'),
        },
        {
          __component: 'blocks.rich-text',
          title: 'Как мы формируем повестку',
          content: blocksParagraph('Мы собираем новости, аналитические материалы, интервью и практические обзоры, чтобы профессионалам и заинтересованным читателям было проще ориентироваться в российском винном рынке.'),
        },
        {
          __component: 'blocks.link-grid',
          title: 'Ключевые разделы портала',
          description: 'Структура сайта строится вокруг редакционного контента и быстрых переходов к важным страницам.',
          links: [
            {
              label: 'Статьи',
              href: '/articles',
              description: 'Аналитика, интервью, обзоры хозяйств и винных регионов.',
            },
            {
              label: 'Новости',
              href: '/news',
              description: 'Оперативная лента отраслевых новостей и релизов.',
            },
          ],
        },
        {
          __component: 'blocks.cta',
          eyebrow: 'Что смотреть дальше',
          title: 'Перейдите к ленте материалов и посмотрите, как редакционный контент работает в реальном интерфейсе',
          description:
            'Главная задача проекта — не просто хранить публикации в CMS, а собирать из них удобный русскоязычный продукт с понятной навигацией, SEO и живыми сценариями чтения.',
          theme: 'dark',
          link: {
            label: 'Открыть статьи',
            href: '/articles',
            description: 'Главная редакционная лента материалов',
          },
        },
      ],
      seo: {
        metaTitle: 'О проекте Виноделие сегодня',
        metaDescription: 'О редакционном проекте Виноделие сегодня, его миссии и фокусе на российской винной индустрии.',
      },
    });

    await upsertBySlug(strapi, 'api::page.page', 'kontakty-redaktsii', {
      title: 'Контакты редакции',
      slug: 'kontakty-redaktsii',
      excerpt: 'Как связаться с редакцией по инфоповодам, партнерствам и отраслевым материалам.',
      showInFooter: true,
      content: [
        {
          __component: 'blocks.hero',
          eyebrow: 'Редакционные контакты',
          title: 'Открыты к инфоповодам, партнёрствам и профессиональному диалогу',
          description:
            'Если у вас есть анонс мероприятия, новость хозяйства, предложение по интервью или аналитический комментарий, редакция готова рассмотреть обращение.',
          theme: 'light',
        },
        {
          __component: 'blocks.rich-text',
          title: 'Связь с редакцией',
          content: blocksParagraph('Пишите в редакцию по вопросам публикаций, новостных поводов, интервью, анонсов мероприятий и профессиональных комментариев. Мы открыты к работе с хозяйствами, экспертами и организаторами отраслевых событий.'),
        },
        {
          __component: 'blocks.quote',
          text: 'Хороший отраслевой портал строится не на шуме, а на точности, контексте и доверии к источникам.',
          author: 'Редакция Виноделие сегодня',
        },
        {
          __component: 'blocks.link-grid',
          title: 'Куда перейти дальше',
          links: [
            {
              label: 'О проекте',
              href: '/o-proekte',
              description: 'Миссия портала и редакционные принципы.',
            },
            {
              label: 'Лента новостей',
              href: '/news',
              description: 'Свежие материалы из мира виноделия.',
            },
          ],
        },
        {
          __component: 'blocks.cta',
          eyebrow: 'Быстрый сценарий',
          title: 'Если хотите оценить продукт глазами читателя, откройте новости и статьи после просмотра контактов',
          description:
            'Так удобнее увидеть, как работают навигация, редакционные страницы, builder-блоки и общий визуальный язык проекта.',
          theme: 'light',
          link: {
            label: 'Открыть ленту новостей',
            href: '/news',
            description: 'Свежие материалы редакции',
          },
        },
      ],
      seo: {
        metaTitle: 'Контакты редакции',
        metaDescription: 'Контакты редакции портала Виноделие сегодня для инфоповодов, партнерств и публикаций.',
      },
    });

    strapi.log.info('Bootstrap completed without demo content seeding.');
  },
};
