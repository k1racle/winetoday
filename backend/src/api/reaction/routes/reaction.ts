export default {
  routes: [
    {
      method: 'GET',
      path: '/reactions/summary',
      handler: 'reaction.summary',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/reactions/toggle',
      handler: 'reaction.toggle',
      config: {
        auth: false,
      },
    },
  ],
};
