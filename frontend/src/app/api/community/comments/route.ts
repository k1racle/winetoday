import { CMS_API_URL } from "@/lib/strapi";
import { getAuthToken } from "@/lib/auth";

function buildCommentsUrl(requestUrl: string) {
  const incomingUrl = new URL(requestUrl);
  const targetUrl = new URL("/api/comments", CMS_API_URL);

  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  return targetUrl;
}

export async function GET(request: Request) {
  const token = await getAuthToken();
  const response = await fetch(buildCommentsUrl(request.url), {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  const response = await fetch(new URL("/api/comments", CMS_API_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
