import { isPrivateSeoRoute, isSearchSeoRoute, isUtilityNoindexRoute } from '~/utils/seo-routes';

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const path = url.pathname;
  const isPreview = url.searchParams.get('preview') === '1' || url.searchParams.get('preview') === 'true';

  if (isPrivateSeoRoute(path)) {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow');
    return;
  }

  if (isSearchSeoRoute(path) || isUtilityNoindexRoute(path) || isPreview) {
    setHeader(event, 'X-Robots-Tag', 'noindex, follow');
  }
});
