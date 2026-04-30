import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::social-auth-setting.social-auth-setting' as any, {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
