import { getAuthToken } from "@/lib/auth";
import { CMS_API_URL } from "@/lib/strapi";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const token = await getAuthToken();
    const contentType = request.headers.get("content-type");
    const contentLength = request.headers.get("content-length");
    const body = await request.arrayBuffer();

    console.info("[editor-upload-proxy] forwarding upload request", {
      contentType,
      contentLength,
      bodyBytes: body.byteLength,
      transport: "raw-body",
    });

    const headers = new Headers();

    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(new URL("/api/editor/upload", CMS_API_URL), {
      method: "POST",
      headers,
      body: new Uint8Array(body),
      cache: "no-store",
    });
    const responseContentType = response.headers.get("Content-Type") ?? "application/octet-stream";

    console.info("[editor-upload-proxy] cms response", {
      status: response.status,
      contentType: responseContentType,
    });

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
    return Response.json({ error: { message: "Не удалось передать файл в CMS." } }, { status: 502 });
  }
}
