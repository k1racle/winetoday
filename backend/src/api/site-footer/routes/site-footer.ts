import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::site-footer.site-footer' as any, {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
