export function isAnalyticsExcludedRoute(path: string): boolean {
  return path.startsWith('/account') || path === '/cms' || path.startsWith('/cms/');
}
