import { CMS_API_URL } from "@/lib/strapi";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    outputFileName: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { outputFileName } = await context.params;
    const headers = new Headers();
    headers.set("X-Watermark-Secret", process.env.WATERMARK_SECRET ?? "");

    const response = await fetch(
      new URL(`/api/editor/watermark/status/${encodeURIComponent(outputFileName)}`, CMS_API_URL),
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

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
    return Response.json({ error: { message: "Не удалось получить статус watermark." } }, { status: 502 });
  }
}
