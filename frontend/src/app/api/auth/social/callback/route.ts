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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jwt = url.searchParams.get("access_token")?.trim();
  const provider = url.searchParams.get("provider")?.trim();

  if (!jwt) {
    return Response.redirect(new URL(`/auth-error?reason=missing-token${provider ? `&provider=${encodeURIComponent(provider)}` : ""}`, SITE_URL));
  }

  await setAuthToken(jwt);
  await ensureMemberProfile(jwt);
  await fetchCurrentUser(jwt);

  return Response.redirect(new URL(DEFAULT_REDIRECT, SITE_URL));
}
