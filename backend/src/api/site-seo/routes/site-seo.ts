import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::site-seo.site-seo' as any, {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
