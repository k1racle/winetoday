import { cmsFetch, isEditorContentType } from "@/lib/editor";

type Params = {
  params: Promise<{
    type: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  const { type } = await params;

  if (!isEditorContentType(type)) {
    return Response.json({ error: "Неизвестный тип материала." }, { status: 400 });
  }

  const response = await cmsFetch(`/api/editor/content/${type}`);
  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export async function POST(request: Request, { params }: Params) {
  const { type } = await params;

  if (!isEditorContentType(type)) {
    return Response.json({ error: "Неизвестный тип материала." }, { status: 400 });
  }

  const payload = await request.text();
  const response = await cmsFetch(`/api/editor/content/${type}`, {
    method: "POST",
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
