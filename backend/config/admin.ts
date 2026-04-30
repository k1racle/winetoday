import type { Core } from '@strapi/strapi';

const getPreviewPathname = (uid: string, document?: { slug?: string | null }) => {
  const slug = document?.slug;

  switch (uid) {
    case 'api::page.page':
      return slug ? `/${slug}` : null;
    case 'api::article.article':
      return slug ? `/articles/${slug}` : null;
    case 'api::news.news':
      return slug ? `/news/${slug}` : null;
    case 'api::event.event':
      return slug ? `/events/${slug}` : null;
    case 'api::video.video':
      return slug ? `/videos/${slug}` : null;
    default:
      return null;
  }
};

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => {
  const clientUrl = env('CLIENT_URL', 'http://localhost');
  const previewSecret = env('PREVIEW_SECRET');

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    preview: {
      enabled: Boolean(previewSecret),
      config: {
        allowedOrigins: [clientUrl],
        async handler(uid, { documentId, status }) {
          if (!previewSecret) {
            return null;
          }

          const document = await strapi.documents(uid as any).findOne({ documentId });
          const pathname = getPreviewPathname(uid, document as { slug?: string | null } | undefined);

          if (!pathname) {
            return null;
          }

          const query = new URLSearchParams({
            url: pathname,
            secret: previewSecret,
            status,
          });

          return `${clientUrl}/api/preview?${query.toString()}`;
        },
      },
    },
  };
};

export default config;
