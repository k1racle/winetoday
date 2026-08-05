export function useUiContext() {
  const route = useRoute();

  const isCmsRoute = computed(
    () => route.path === '/cms' || route.path.startsWith('/cms/'),
  );
  const isAccountRoute = computed(
    () => route.path === '/account' || route.path.startsWith('/account/'),
  );

  return {
    isCmsRoute,
    isAccountRoute,
  };
}
