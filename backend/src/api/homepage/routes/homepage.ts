import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::homepage.homepage' as any, {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
