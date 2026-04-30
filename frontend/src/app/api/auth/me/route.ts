import { fetchCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await fetchCurrentUser();
  return Response.json({
    authenticated: Boolean(user),
    mode: user?.mode ?? null,
    user,
  });
}
