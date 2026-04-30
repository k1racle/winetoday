import { revalidatePath } from "next/cache";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

type RevalidatePayload = {
  secret?: string;
  paths?: string[];
};

export async function POST(request: Request) {
  let payload: RevalidatePayload;

  try {
    payload = (await request.json()) as RevalidatePayload;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!REVALIDATE_SECRET || payload.secret !== REVALIDATE_SECRET) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const paths = Array.from(new Set((payload.paths ?? []).filter((path) => typeof path === "string" && path.startsWith("/"))));

  if (!paths.length) {
    return Response.json({ ok: false, error: "No valid paths provided" }, { status: 400 });
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return Response.json({ ok: true, revalidated: paths });
}
