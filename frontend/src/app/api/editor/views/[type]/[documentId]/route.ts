import { CMS_API_URL } from "@/lib/strapi";

export const runtime = "nodejs";

const ALLOWED_VIEW_TYPES = new Set(["article", "news", "video", "gallery"]);

type RouteContext = {
  params: Promise<{
    type: string;
    documentId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { type, documentId } = await context.params;

    if (!ALLOWED_VIEW_TYPES.has(type) || !documentId) {
      return Response.json({ error: { message: "Некорректный запрос счётчика просмотров." } }, { status: 400 });
    }

    const response = await fetch(new URL(`/api/editor/views/${type}/${documentId}`, CMS_API_URL), {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
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
    return Response.json({ error: { message: "Не удалось передать счётчик просмотров в CMS." } }, { status: 502 });
  }
}
