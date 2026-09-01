import { isPrivateSeoRoute, isSearchSeoRoute, isUtilityNoindexRoute } from '~/utils/seo-routes';
import { getSiteSeoFlags } from '~/server/utils/site-seo';

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const path = url.pathname;
  const isPreview = url.searchParams.get('preview') === '1' || url.searchParams.get('preview') === 'true';
  const config = useRuntimeConfig();
  const indexNowKey = `${config.indexNowKey || ''}`.trim();
  if (/^[A-Za-z0-9-]{8,128}$/.test(indexNowKey) && path === `/${indexNowKey}.txt`) {
    setHeader(event, 'X-Robots-Tag', 'noindex');
    return;
  }

  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';
  const { robotsEnabled } = await getSiteSeoFlags(apiUrl);

  if (robotsEnabled === false) {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow');
    return;
  }

  if (isPrivateSeoRoute(path)) {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow');
    return;
  }

  if (isSearchSeoRoute(path) || isUtilityNoindexRoute(path) || isPreview) {
    setHeader(event, 'X-Robots-Tag', 'noindex, follow');
  }
});
