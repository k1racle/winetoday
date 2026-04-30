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
      method: 'POST',
      path: '/editor/upload',
      handler: 'editor.upload',
      config: {
        body: {
          multipart: true,
        },
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
