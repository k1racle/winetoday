import { NextRequest, NextResponse } from "next/server";
import { CMS_API_URL } from "@/lib/strapi";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const backendUrl = new URL("/api/views/summary", CMS_API_URL);
  searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  try {
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "Unknown error");
      return NextResponse.json(
        { error: "Failed to fetch views summary", details: text },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch views summary", details: String(error) },
      { status: 500 },
    );
  }
}
