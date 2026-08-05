export default defineNuxtRouteMiddleware(async () => {
  const { fetchUser, refreshToken, isAuthenticated } = useAuth();
  let authenticated = !!(await fetchUser());

  if (!authenticated) {
    authenticated = await refreshToken();
  }

  if (!authenticated || !isAuthenticated.value) {
    return navigateTo('/');
  }
});
