import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::video.video' as any, {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
