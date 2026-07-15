export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/account')) return;

  const { fetchUser, refreshToken, isAuthenticated, user } = useAuth();
  let authenticated = !!(await fetchUser());
  if (!authenticated) {
    authenticated = await refreshToken();
  }

  if (!authenticated || !isAuthenticated.value) {
    return navigateTo('/');
  }

  if (to.path.startsWith('/account/admin')) {
    if (user.value?.role !== 'admin') {
      return navigateTo('/account');
    }
  }
});
