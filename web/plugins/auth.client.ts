export default defineNuxtPlugin(() => {
  const { isAuthenticated, fetchUser, refreshToken } = useAuth();

  // Restore session after a full page reload: try the access cookie first,
  // fall back to the refresh cookie (both are httpOnly, so they are always sent).
  if (!isAuthenticated.value) {
    fetchUser().then((data) => {
      if (!data) refreshToken();
    });
  }

  // Refresh access token every 10 minutes (token lifetime is 15 minutes).
  // В скрытой вкладке не обновляем — меньше гонок за ротацию refresh-токена,
  // а при возвращении во вкладку сразу обновляем (токен мог протухнуть за время сна).
  const interval = setInterval(() => {
    if (isAuthenticated.value && document.visibilityState === 'visible') refreshToken();
  }, 10 * 60 * 1000);

  const onVisible = () => {
    if (document.visibilityState === 'visible' && isAuthenticated.value) refreshToken();
  };
  document.addEventListener('visibilitychange', onVisible);

  return {
    setup() {
      onScopeDispose(() => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', onVisible);
      });
    },
  };
});
