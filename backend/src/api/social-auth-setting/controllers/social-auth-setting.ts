import { factories } from '@strapi/strapi';

function buildProviderCallbackUrls(strapi: any, ctx?: any) {
  const configuredServerUrl = strapi.config.get('server.url') as string | undefined;
  const apiPrefix = (strapi.config.get('api.rest.prefix') as string | undefined) ?? '/api';
  const requestOrigin = ctx?.request?.origin as string | undefined;
  const requestProtocol = ctx?.request?.protocol as string | undefined;
  const requestHost = ctx?.request?.host as string | undefined;
  const fallbackOrigin = requestOrigin || (requestProtocol && requestHost ? `${requestProtocol}://${requestHost}` : undefined);
  const baseUrl = (configuredServerUrl || fallbackOrigin || '').replace(/\/$/, '');
  const authBaseUrl = `${baseUrl}${apiPrefix}`.replace(/\/$/, '');

  return {
    google: `${authBaseUrl}/auth/google/callback`,
    vk: `${authBaseUrl}/auth/vk/callback`,
  };
}

async function buildPublicSocialAuthSettingsResponse(strapi: any, ctx?: any) {
  const document = await strapi.documents('api::social-auth-setting.social-auth-setting' as any).findFirst();
  const callbackUrls = buildProviderCallbackUrls(strapi, ctx);

  return {
    data: document
      ? {
          id: document.id,
          documentId: document.documentId,
          googleEnabled: document.googleEnabled ?? false,
          vkEnabled: document.vkEnabled ?? false,
          callbackUrls,
        }
      : {
          googleEnabled: false,
          vkEnabled: false,
          callbackUrls,
        },
  };
}

export default factories.createCoreController('api::social-auth-setting.social-auth-setting' as any, ({ strapi }) => ({
  async find(ctx) {
    ctx.body = await buildPublicSocialAuthSettingsResponse(strapi, ctx);
  },

  async findOne(ctx) {
    ctx.body = await buildPublicSocialAuthSettingsResponse(strapi, ctx);
  },
}));
