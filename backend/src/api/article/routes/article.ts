import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::article.article' as any, {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
