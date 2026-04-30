import { cmsFetch } from "@/lib/editor";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const forwardedFormData = new FormData();

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        forwardedFormData.append(key, value, value.name);
        continue;
      }

      forwardedFormData.append(key, value);
    }

    const fileEntries = Array.from(formData.entries()).filter(([, value]) => value instanceof File);

    console.info("[editor-upload-proxy] forwarding upload request", {
      contentType: request.headers.get("content-type") ?? "",
      formKeys: Array.from(new Set(Array.from(formData.keys()))),
      fileCount: fileEntries.length,
      fileFieldNames: fileEntries.map(([key]) => key),
    });

    const response = await cmsFetch("/api/editor/upload", {
      method: "POST",
      body: forwardedFormData,
    });
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
