import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::news.news' as any, {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
