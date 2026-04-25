import { NextResponse } from "next/server";
import { rankPurchaseOptions } from "@/lib/shopping-backend.mjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = rankPurchaseOptions(body ?? {});
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid request",
      },
      { status: 400 }
    );
  }
}
