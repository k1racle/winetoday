export default {
  routes: [
    {
      method: 'GET',
      path: '/editor/session',
      handler: 'editor.session',
    },
    {
      method: 'GET',
      path: '/editor/content/:type',
      handler: 'editor.list',
    },
    {
      method: 'GET',
      path: '/editor/content/:type/:documentId',
      handler: 'editor.findOne',
    },
    {
      method: 'GET',
      path: '/editor/authors',
      handler: 'editor.authors',
    },
    {
      method: 'GET',
      path: '/editor/categories',
      handler: 'editor.categories',
    },
    {
      method: 'GET',
      path: '/editor/tags',
      handler: 'editor.tags',
    },
    {
      method: 'GET',
      path: '/editor/media',
      handler: 'editor.media',
    },
    {
      method: 'GET',
      path: '/editor/author-stats/:documentId',
      handler: 'editor.authorStats',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/editor/views-stats',
      handler: 'editor.viewsStats',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/editor/member-profile-stats/:documentId',
      handler: 'editor.memberProfileStats',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/editor/views/:type/:documentId',
      handler: 'editor.trackView',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/editor/upload',
      handler: 'editor.upload',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/editor/watermark/:id',
      handler: 'editor.watermark',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/editor/watermark/status/:outputFileName',
      handler: 'editor.watermarkStatus',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/editor/content/:type',
      handler: 'editor.save',
    },
    {
      method: 'PUT',
      path: '/editor/content/:type/:documentId',
      handler: 'editor.save',
    },
    {
      method: 'DELETE',
      path: '/editor/content/:type/:documentId',
      handler: 'editor.delete',
    },
  ],
};
