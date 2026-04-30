import { getAuthToken } from "@/lib/auth";
import { CMS_API_URL } from "@/lib/strapi";

export async function POST(request: Request) {
  try {
    const token = await getAuthToken();
    const contentType = request.headers.get("content-type") ?? "";
    const contentLength = request.headers.get("content-length");
    const requestBody = await request.arrayBuffer();

    console.info("[editor-upload-proxy] forwarding upload request", {
      contentType,
      contentLength,
      bodyBytes: requestBody.byteLength,
    });

    const headers = new Headers();

    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(new URL("/api/editor/upload", CMS_API_URL), {
      method: "POST",
      headers,
      body: requestBody,
      cache: "no-store",
    });
    const responseBody = await response.text();

    console.info("[editor-upload-proxy] cms response", {
      status: response.status,
      contentType: response.headers.get("Content-Type") ?? null,
    });

    return new Response(responseBody, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return Response.json({ error: { message: "Не удалось передать файл в CMS." } }, { status: 502 });
  }
}
