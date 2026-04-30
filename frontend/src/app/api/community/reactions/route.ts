import { CMS_API_URL } from "@/lib/strapi";
import { getAuthToken } from "@/lib/auth";
import { cookies } from "next/headers";

const GUEST_REACTION_COOKIE = "guest-reaction-id";

async function resolveGuestId() {
  const cookieStore = await cookies();
  let guestId = cookieStore.get(GUEST_REACTION_COOKIE)?.value?.trim();

  if (!guestId) {
    guestId = crypto.randomUUID();
    cookieStore.set(GUEST_REACTION_COOKIE, guestId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return guestId;
}

function buildSummaryUrl(requestUrl: string) {
  const incomingUrl = new URL(requestUrl);
  const targetUrl = new URL("/api/reactions/summary", CMS_API_URL);

  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  return targetUrl;
}

export async function GET(request: Request) {
  const token = await getAuthToken();
  const guestId = await resolveGuestId();
  const response = await fetch(buildSummaryUrl(request.url), {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(guestId ? { "x-guest-id": guestId } : {}),
    },
    cache: "no-store",
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export async function POST(request: Request) {
  const payload = await request.text();
  const token = await getAuthToken();
  const guestId = await resolveGuestId();

  const response = await fetch(new URL("/api/reactions/toggle", CMS_API_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(guestId ? { "x-guest-id": guestId } : {}),
    },
    body: payload,
    cache: "no-store",
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
