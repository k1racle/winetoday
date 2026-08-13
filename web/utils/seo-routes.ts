export function isPrivateSeoRoute(path: string): boolean {
  return path.startsWith('/account') || path === '/cms' || path.startsWith('/cms/');
}

export function isSearchSeoRoute(path: string): boolean {
  return path === '/search' || path.startsWith('/search/') || path === '/winemakers/search' || path.startsWith('/winemakers/search/');
}

export function isUtilityNoindexRoute(path: string): boolean {
  return (
    path === '/newsletter/confirm' ||
    path === '/newsletter/preferences' ||
    path === '/unsubscribe'
  );
}

export function shouldNoindexByPath(path: string): boolean {
  return isPrivateSeoRoute(path) || isSearchSeoRoute(path) || isUtilityNoindexRoute(path);
}
