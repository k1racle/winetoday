import { cmsFetch } from "@/lib/editor";

export async function GET() {
  try {
    const response = await cmsFetch("/api/editor/media");
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return Response.json({ error: { message: "Не удалось получить медиатеку из CMS." } }, { status: 502 });
  }
}
