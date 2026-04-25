import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/shopping-backend.mjs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const result = searchProducts({
    query: searchParams.get("query") ?? "",
    category: searchParams.get("category") ?? undefined,
    maxResults: Number(searchParams.get("maxResults") ?? 5),
  });

  return NextResponse.json(result);
}
