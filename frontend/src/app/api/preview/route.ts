import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

const PREVIEW_SECRET = process.env.PREVIEW_SECRET;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const url = searchParams.get("url");

  if (!PREVIEW_SECRET || secret !== PREVIEW_SECRET || !url || !url.startsWith("/")) {
    return new Response("Недопустимый запрос предпросмотра", { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(url);
}
