export default {
  routes: [
    {
      method: 'GET',
      path: '/member-profile/me',
      handler: 'member-profile.me',
    },
    {
      method: 'PUT',
      path: '/member-profile/me',
      handler: 'member-profile.updateMe',
    },
  ],
};
