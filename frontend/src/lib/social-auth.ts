const SITE_URL = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1";

export type SocialAuthProvider = "google" | "vk";

export function buildSocialAuthUrl(provider: SocialAuthProvider, accountType: "subscriber" | "author" = "subscriber") {
  const callbackUrl = new URL("/api/auth/social/callback", SITE_URL);
  callbackUrl.searchParams.set("accountType", accountType);
  callbackUrl.searchParams.set("provider", provider);

  const connectUrl = new URL(`/api/connect/${provider}`, SITE_URL);
  connectUrl.searchParams.set("callback", callbackUrl.toString());

  return `${connectUrl.pathname}${connectUrl.search}`;
}
