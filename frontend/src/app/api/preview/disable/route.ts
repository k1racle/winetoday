import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const safeUrl = url && url.startsWith("/") ? url : "/";

  const draft = await draftMode();
  draft.disable();

  redirect(safeUrl);
}
