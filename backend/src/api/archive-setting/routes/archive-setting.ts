import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::archive-setting.archive-setting' as any, {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
