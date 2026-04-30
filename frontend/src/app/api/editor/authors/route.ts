import { cmsFetch } from "@/lib/editor";

export async function GET() {
  const response = await cmsFetch("/api/editor/authors");
  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
