import { CMS_API_URL } from "@/lib/strapi";

type RouteContext = {
  params: Promise<{
    provider: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { provider } = await context.params;
  const requestUrl = new URL(request.url);
  const targetUrl = new URL(`/api/connect/${provider}`, CMS_API_URL);

  requestUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const response = await fetch(targetUrl, {
    method: "GET",
    redirect: "manual",
    cache: "no-store",
  });

  const location = response.headers.get("location");

  if (!location) {
    const upstreamBody = await response.text().catch(() => "");
    const message = upstreamBody.trim() || "Social auth redirect location is missing.";

    return new Response(message, {
      status: response.status === 200 ? 502 : response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "text/plain; charset=utf-8",
      },
    });
  }

  return Response.redirect(location, response.status);
}
