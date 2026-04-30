import { getAuthProviders } from "@/lib/auth";

export async function GET() {
  return Response.json({ providers: await getAuthProviders() });
}
