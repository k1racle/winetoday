import { cookies } from "next/headers";

import { CMS_API_URL } from "@/lib/strapi";
import type { AuthMode } from "@/lib/auth-shared";
import { resolveAuthMode } from "@/lib/auth-shared";
import { buildSocialAuthUrl } from "@/lib/social-auth";

const AUTH_COOKIE_NAME = "vino_auth_jwt";

type StrapiAuthResponse = {
  jwt?: string;
  user?: {
    id: number;
    username?: string | null;
    email?: string | null;
  } | null;
};

type MemberProfileResponse = {
  id: number;
  username: string;
  email?: string | null;
  mode?: AuthMode | null;
  memberProfile?: {
    id: number;
    displayName?: string | null;
    bio?: string | null;
    accountType?: "editor" | "author" | "subscriber" | null;
    isApprovedAuthor?: boolean | null;
    authorSlug?: string | null;
    author?: {
      id: number;
      name?: string | null;
      slug?: string | null;
    } | null;
  } | null;
};

export type AuthUser = MemberProfileResponse;

export type AuthProvider = {
  id: "google" | "vk" | "yandex";
  label: string;
  enabled: boolean;
};

const AUTH_PROVIDER_LABELS: Record<AuthProvider["id"], string> = {
  google: "Google",
  vk: "VK",
  yandex: "Яндекс",
};

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}

export async function setAuthToken(token: string) {
  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, token, cookieOptions());
}

export async function clearAuthToken() {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
}

export async function getAuthToken() {
  const store = await cookies();
  return store.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export async function getAuthProviders() {
  const response = await fetch(new URL("/api/social-auth-setting", CMS_API_URL), {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return Object.entries(AUTH_PROVIDER_LABELS).map(([id, label]) => ({
      id: id as AuthProvider["id"],
      label,
      enabled: false,
    }));
  }

  const payload = (await response.json().catch(() => null)) as {
    data?: {
      googleEnabled?: boolean | null;
      vkEnabled?: boolean | null;
      yandexEnabled?: boolean | null;
    } | null;
  } | null;

  return [
    { id: "google" as const, label: AUTH_PROVIDER_LABELS.google, enabled: Boolean(payload?.data?.googleEnabled) },
    { id: "vk" as const, label: AUTH_PROVIDER_LABELS.vk, enabled: Boolean(payload?.data?.vkEnabled) },
    { id: "yandex" as const, label: AUTH_PROVIDER_LABELS.yandex, enabled: Boolean(payload?.data?.yandexEnabled) },
  ];
}

export { buildSocialAuthUrl };

export async function fetchCurrentUser(token?: string | null): Promise<AuthUser | null> {
  const jwt = token ?? (await getAuthToken());

  if (!jwt) {
    return null;
  }

  const response = await fetch(new URL("/api/member-profile/me", CMS_API_URL), {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const user = (await response.json()) as MemberProfileResponse | null;

  if (!user?.id) {
    return null;
  }

  return {
    ...user,
    username: user.username?.trim() || user.email?.trim() || `user-${user.id}`,
    email: user.email ?? null,
    mode: user.mode ?? resolveAuthMode({
      accountType: user.memberProfile?.accountType ?? null,
    }),
    memberProfile: user.memberProfile
      ? {
          id: user.memberProfile.id,
          displayName: user.memberProfile.displayName?.trim() || null,
          bio: user.memberProfile.bio?.trim() || null,
          accountType: user.memberProfile.accountType ?? null,
          isApprovedAuthor: user.memberProfile.isApprovedAuthor ?? false,
          authorSlug: user.memberProfile.authorSlug?.trim() || null,
          author: user.memberProfile.author?.id
            ? {
                id: user.memberProfile.author.id,
                name: user.memberProfile.author.name?.trim() || null,
                slug: user.memberProfile.author.slug?.trim() || null,
              }
            : null,
        }
      : null,
  };
}

async function ensureMemberProfile(token: string, options?: { accountType?: "subscriber"; displayName?: string | null }) {
  await fetch(new URL("/api/member-profile/me", CMS_API_URL), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!options?.accountType && !options?.displayName) {
    return;
  }

  await fetch(new URL("/api/member-profile/me", CMS_API_URL), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        accountType: options.accountType,
        displayName: options.displayName ?? undefined,
      },
    }),
    cache: "no-store",
  });
}

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  accountType: "subscriber";
  displayName?: string;
};

export async function registerWithEmail(payload: RegisterPayload) {
  const response = await fetch(new URL("/api/auth/local/register", CMS_API_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as StrapiAuthResponse & { error?: { message?: string } } | null;

  if (!response.ok || !data?.jwt) {
    throw new Error(data?.error?.message || "Не удалось зарегистрироваться.");
  }

  await setAuthToken(data.jwt);
  await ensureMemberProfile(data.jwt, {
    accountType: payload.accountType,
    displayName: payload.displayName || payload.username,
  });

  return {
    user: await fetchCurrentUser(data.jwt),
  };
}

export async function loginWithIdentifier(identifier: string, password: string) {
  const response = await fetch(new URL("/api/auth/local", CMS_API_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier, password }),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as StrapiAuthResponse & { error?: { message?: string } } | null;

  if (!response.ok || !data?.jwt) {
    throw new Error(data?.error?.message || "Не удалось войти.");
  }

  await setAuthToken(data.jwt);

  return {
    user: await fetchCurrentUser(data.jwt),
  };
}
