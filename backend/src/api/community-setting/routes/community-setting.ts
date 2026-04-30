import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::community-setting.community-setting' as any, {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
