import { cmsFetch, isEditorContentType } from "@/lib/editor";

type Params = {
  params: Promise<{
    type: string;
    documentId: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  const { type, documentId } = await params;

  if (!isEditorContentType(type) || !documentId) {
    return Response.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  const response = await cmsFetch(`/api/editor/content/${type}/${documentId}`);
  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export async function PUT(request: Request, { params }: Params) {
  const { type, documentId } = await params;

  if (!isEditorContentType(type) || !documentId) {
    return Response.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  const payload = await request.text();
  const response = await cmsFetch(`/api/editor/content/${type}/${documentId}`, {
    method: "PUT",
    body: payload,
  });
  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export async function DELETE(_: Request, { params }: Params) {
  const { type, documentId } = await params;

  if (!isEditorContentType(type) || !documentId) {
    return Response.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  const response = await cmsFetch(`/api/editor/content/${type}/${documentId}`, {
    method: "DELETE",
  });
  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
