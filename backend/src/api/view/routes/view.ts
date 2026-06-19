export default {
  routes: [
    {
      method: 'POST',
      path: '/views/increment',
      handler: 'view.increment',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/views/summary',
      handler: 'view.summary',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/views/author-stats/:documentId',
      handler: 'view.authorStats',
      config: {
        auth: false,
      },
    },
  ],
};
