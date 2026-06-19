import { NextRequest, NextResponse } from "next/server";
import { CMS_API_URL } from "@/lib/strapi";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Author id is required" }, { status: 400 });
  }

  try {
    const response = await fetch(`${CMS_API_URL}/api/views/author-stats/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "Unknown error");
      return NextResponse.json(
        { error: "Failed to fetch author stats", details: text },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch author stats", details: String(error) },
      { status: 500 },
    );
  }
}
