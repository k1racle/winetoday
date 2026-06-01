import { fetchCurrentUser, setAuthToken } from "@/lib/auth";
import { CMS_API_URL, SITE_URL } from "@/lib/strapi";

const DEFAULT_REDIRECT = "/account";

type ResolveStrapiJwtResult =
  | { jwt: string }
  | { error: string; status?: number; body?: string };

function buildAuthErrorUrl(params: { reason: string; provider?: string; status?: number }) {
  const errorUrl = new URL("/auth-error", SITE_URL);

  errorUrl.searchParams.set("reason", params.reason);

  if (params.provider) {
    errorUrl.searchParams.set("provider", params.provider);
  }

  if (params.status) {
    errorUrl.searchParams.set("status", String(params.status));
  }

  return errorUrl;
}

function safeLogBody(value: string) {
  return value
    .replace(/access_token=[^&\s"]+/gi, "access_token=[redacted]")
    .replace(/jwt["']?\s*:\s*["'][^"']+["']/gi, 'jwt:"[redacted]"')
    .slice(0, 1000);
}

function parseAuthPayload(body: string) {
  try {
    return (body ? JSON.parse(body) : null) as { jwt?: string } | null;
  } catch {
    return null;
  }
}

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

async function resolveStrapiJwt(provider: string | undefined, accessToken: string): Promise<ResolveStrapiJwtResult> {
  if (!provider) {
    return { jwt: accessToken };
  }

  const response = await fetch(new URL(`/api/auth/${provider}/callback?access_token=${encodeURIComponent(accessToken)}`, CMS_API_URL), {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const body = await response.text().catch(() => "");
  const payload = parseAuthPayload(body);
  const jwt = payload?.jwt?.trim();

  if (!response.ok || !jwt) {
    return {
      error: response.ok ? "empty-jwt" : "strapi-callback-failed",
      status: response.status,
      body: safeLogBody(body),
    };
  }

  return { jwt };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const providerParam = url.searchParams.get("provider")?.trim();
  const providerParts = providerParam?.split("?access_token=") ?? [];
  const provider = providerParts[0]?.trim();
  const jwt = (url.searchParams.get("access_token") ?? providerParts[1])?.trim();

  if (!jwt) {
    console.error("Social auth callback is missing provider access token", { provider, query: safeLogBody(url.searchParams.toString()) });
    return Response.redirect(buildAuthErrorUrl({ reason: "missing-token", provider }));
  }

  const strapiJwtResult = await resolveStrapiJwt(provider, jwt);

  if ("error" in strapiJwtResult) {
    console.error("Social auth Strapi callback failed", {
      provider,
      reason: strapiJwtResult.error,
      status: strapiJwtResult.status,
      body: strapiJwtResult.body,
    });
    return Response.redirect(buildAuthErrorUrl({ reason: strapiJwtResult.error, provider, status: strapiJwtResult.status }));
  }

  await setAuthToken(strapiJwtResult.jwt);
  await ensureMemberProfile(strapiJwtResult.jwt);
  await fetchCurrentUser(strapiJwtResult.jwt);

  return Response.redirect(new URL(DEFAULT_REDIRECT, SITE_URL));
}
