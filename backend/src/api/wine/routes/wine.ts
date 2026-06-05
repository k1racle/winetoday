import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::wine.wine' as any, {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
