import { cmsFetch } from "@/lib/editor";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const requestInit: RequestInit & { duplex: "half" } = {
      method: "POST",
      headers: contentType ? { "Content-Type": contentType } : {},
      body: request.body,
      duplex: "half",
    };

    console.info("[editor-upload-proxy] forwarding upload request", {
      contentType,
      hasBody: request.body !== null,
    });

    const response = await cmsFetch("/api/editor/upload", requestInit);
    const body = await response.text();

    console.info("[editor-upload-proxy] cms response", {
      status: response.status,
      contentType: response.headers.get("Content-Type") ?? null,
    });

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
