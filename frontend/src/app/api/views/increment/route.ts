import { NextRequest, NextResponse } from "next/server";
import { CMS_API_URL } from "@/lib/strapi";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = (body.data ?? body) as Record<string, unknown>;
  const viewerId = request.headers.get("x-viewer-id") || payload.viewerId || "";

  const data = {
    ...payload,
    viewerId: typeof viewerId === "string" ? viewerId : "",
  };

  try {
    const response = await fetch(`${CMS_API_URL}/api/views/increment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": request.headers.get("x-forwarded-for") ?? "",
        "X-Viewer-Id": typeof viewerId === "string" ? viewerId : "",
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "Unknown error");
      return NextResponse.json(
        { error: "Failed to track view", details: text },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to track view", details: String(error) },
      { status: 500 },
    );
  }
}
