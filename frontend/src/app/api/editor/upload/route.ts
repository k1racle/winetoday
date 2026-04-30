import { cmsFetch } from "@/lib/editor";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const response = await cmsFetch("/api/editor/upload", {
      method: "POST",
      headers: {},
      body: formData,
    });
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return Response.json({ error: { message: "Не удалось передать файл в CMS." } }, { status: 502 });
  }
}
