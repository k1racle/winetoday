export default defineNuxtPlugin(() => {
  const { isAuthenticated, fetchUser, refreshToken } = useAuth();

  // Restore session after a full page reload: try the access cookie first,
  // fall back to the refresh cookie (both are httpOnly, so they are always sent).
  if (!isAuthenticated.value) {
    fetchUser().then((data) => {
      if (!data) refreshToken();
    });
  }

  // Refresh access token every 10 minutes (token lifetime is 15 minutes)
  const interval = setInterval(() => {
    if (isAuthenticated.value) refreshToken();
  }, 10 * 60 * 1000);

  return {
    setup() {
      onScopeDispose(() => clearInterval(interval));
    },
  };
});
