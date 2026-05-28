import { cmsFetch } from "@/lib/editor";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const response = await cmsFetch(`/api/editor/author-stats/${documentId}`);
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return Response.json({ error: { message: "Не удалось загрузить статистику автора из CMS." } }, { status: 502 });
  }
}
