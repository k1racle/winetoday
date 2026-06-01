import { fetchCurrentUser, setAuthToken } from "@/lib/auth";
import { CMS_API_URL, SITE_URL } from "@/lib/strapi";

const DEFAULT_REDIRECT = "/account";

async function ensureMemberProfile(jwt: string) {
  const profileResponse = await fetch(new URL("/api/member-profile/me", CMS_API_URL), {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const profile = (await profileResponse.json().catch(() => null)) as { username?: string | null; memberProfile?: { displayName?: string | null } | null } | null;

  await fetch(new URL("/api/member-profile/me", CMS_API_URL), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        accountType: "subscriber",
        displayName: profile?.memberProfile?.displayName?.trim() || profile?.username?.trim() || undefined,
      },
    }),
    cache: "no-store",
  });
}

async function resolveStrapiJwt(provider: string | undefined, accessToken: string) {
  if (!provider) {
    return accessToken;
  }

  const response = await fetch(new URL(`/api/auth/${provider}/callback?access_token=${encodeURIComponent(accessToken)}`, CMS_API_URL), {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as { jwt?: string } | null;

  return payload?.jwt?.trim() || accessToken;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const providerParam = url.searchParams.get("provider")?.trim();
  const providerParts = providerParam?.split("?access_token=") ?? [];
  const provider = providerParts[0]?.trim();
  const jwt = (url.searchParams.get("access_token") ?? providerParts[1])?.trim();

  if (!jwt) {
    return Response.redirect(new URL(`/auth-error?reason=missing-token${provider ? `&provider=${encodeURIComponent(provider)}` : ""}`, SITE_URL));
  }

  const strapiJwt = await resolveStrapiJwt(provider, jwt);

  await setAuthToken(strapiJwt);
  await ensureMemberProfile(strapiJwt);
  await fetchCurrentUser(strapiJwt);

  return Response.redirect(new URL(DEFAULT_REDIRECT, SITE_URL));
}
