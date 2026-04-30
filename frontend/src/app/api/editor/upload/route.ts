import { getAuthToken } from "@/lib/auth";
import { CMS_API_URL } from "@/lib/strapi";

export async function POST(request: Request) {
  try {
    const token = await getAuthToken();
    const incomingFormData = await request.formData();
    const forwardedFormData = new FormData();
    let fileCount = 0;
    const filenames: string[] = [];

    for (const [key, value] of incomingFormData.entries()) {
      if (value instanceof File) {
        forwardedFormData.append(key, value, value.name);
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
    });

    const headers = new Headers();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(new URL("/api/editor/upload", CMS_API_URL), {
      method: "POST",
      headers,
      body: forwardedFormData,
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
