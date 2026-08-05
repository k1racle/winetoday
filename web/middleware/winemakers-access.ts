export default defineNuxtRouteMiddleware(async () => {
  const { getSiteSettings } = useApi();
  const { fetchUser, refreshToken, user, isAuthenticated } = useAuth();

  const settings = await getSiteSettings().catch(() => null) as any;
  if (settings?.winemakersEnabled) {
    return;
  }

  let authenticated = !!(await fetchUser());
  if (!authenticated) {
    authenticated = await refreshToken();
  }

  if (authenticated && isAuthenticated.value && user.value?.role === 'admin') {
    return;
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Страница не найдена',
  });
});
