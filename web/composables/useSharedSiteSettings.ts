export function useSharedSiteSettings() {
  const { getSiteSettings } = useApi();

  const { data: siteSettings, pending, error } = useAsyncData('site-settings-shared', () =>
    getSiteSettings().catch(() => null),
  );

  return { siteSettings, pending, error };
}
