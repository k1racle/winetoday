import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::gallery.gallery' as any, {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});

