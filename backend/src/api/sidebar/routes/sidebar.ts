import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::sidebar.sidebar' as any, {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
