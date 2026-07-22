export function appendUtm(
  url: string,
  source: string,
  medium: string,
  campaign: string = 'regular',
): string {
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : undefined);
    u.searchParams.set('utm_source', source);
    u.searchParams.set('utm_medium', medium);
    u.searchParams.set('utm_campaign', campaign);
    return u.toString();
  } catch {
    return url;
  }
}
