export default {
  routes: [
    {
      method: 'GET',
      path: '/comments',
      handler: 'comment.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/comments/:id',
      handler: 'comment.findOne',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/comments',
      handler: 'comment.create',
      config: {
        auth: false,
      },
    },
  ],
};
