import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::site-header.site-header' as any, {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
