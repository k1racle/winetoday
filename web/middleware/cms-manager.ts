export default defineNuxtRouteMiddleware(async () => {
  const { fetchUser, refreshToken, isAuthenticated, user } = useAuth();
  let authenticated = !!(await fetchUser());

  if (!authenticated) {
    authenticated = await refreshToken();
  }

  if (!authenticated || !isAuthenticated.value) {
    return navigateTo('/');
  }

  if (!['admin', 'editor'].includes(user.value?.role || '')) {
    return navigateTo('/account');
  }
});
