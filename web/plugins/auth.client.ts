export default defineNuxtPlugin(() => {
  const { isAuthenticated, refreshToken } = useAuth();

  if (!isAuthenticated.value) return;

  // Refresh access token every 10 minutes (token lifetime is 15 minutes)
  const interval = setInterval(() => {
    refreshToken();
  }, 10 * 60 * 1000);

  return {
    setup() {
      onScopeDispose(() => clearInterval(interval));
    },
  };
});
