import { clearAuthToken } from "@/lib/auth";

export async function POST() {
  await clearAuthToken();
  return Response.json({ ok: true });
}
