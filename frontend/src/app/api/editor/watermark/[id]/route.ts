import { getAuthToken } from "@/lib/auth";
import { CMS_API_URL } from "@/lib/strapi";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const token = await getAuthToken();
    const payload = await request.text();

    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(new URL(`/api/editor/watermark/${id}`, CMS_API_URL), {
      method: "POST",
      headers,
      body: payload,
      cache: "no-store",
    });

    const responseContentType = response.headers.get("Content-Type") ?? "application/json";

    if (responseContentType.toLowerCase().includes("application/json")) {
      const responseJson = await response.json().catch(() => null);
      return Response.json(responseJson, { status: response.status });
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": responseContentType,
      },
    });
  } catch {
    return Response.json({ error: { message: "Не удалось передать watermark в CMS." } }, { status: 502 });
  }
}
