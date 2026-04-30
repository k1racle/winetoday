import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::page.page' as any, {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
