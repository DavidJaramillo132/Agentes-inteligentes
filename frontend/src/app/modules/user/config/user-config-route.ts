export const userConfigRoutes = {
  base: {
    path: 'account',
    url: '/account',
  },
  children: {
    profile: {
      path: 'profile',
      url: '/account/profile',
    },
    settings: {
      path: 'settings',
      url: '/account/settings',
    },
  },
};
