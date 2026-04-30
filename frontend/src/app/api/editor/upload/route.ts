import { getAuthToken } from "@/lib/auth";
import { CMS_API_URL } from "@/lib/strapi";
import FormData from "form-data";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const token = await getAuthToken();
    const incomingFormData = await request.formData();
    const forwardedFormData = new FormData();
    let fileCount = 0;
    const filenames: string[] = [];

    for (const [key, value] of incomingFormData.entries()) {
      if (value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());

        forwardedFormData.append(key, buffer, {
          filename: value.name,
          contentType: value.type || "application/octet-stream",
          knownLength: buffer.length,
        });
        fileCount += 1;
        filenames.push(value.name);
        continue;
      }

      forwardedFormData.append(key, value);
    }

    console.info("[editor-upload-proxy] forwarding upload request", {
      fieldCount: Array.from(incomingFormData.keys()).length,
      fileCount,
      filenames,
      transport: "form-data-buffer",
    });

    const headers = new Headers();
    const multipartHeaders = forwardedFormData.getHeaders();

    for (const [key, value] of Object.entries(multipartHeaders)) {
      headers.set(key, value);
    }

    headers.set("Content-Length", String(forwardedFormData.getLengthSync()));

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(new URL("/api/editor/upload", CMS_API_URL), {
      method: "POST",
      headers,
      body: new Uint8Array(forwardedFormData.getBuffer()),
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
