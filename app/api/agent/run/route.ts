import { NextResponse } from "next/server";
import { runShoppingAgent } from "@/lib/openai-shopping-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query =
      typeof body?.query === "string" ? body.query.trim() : "";

    if (!query) {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

    const result = await runShoppingAgent(query);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Agent request failed",
      },
      { status: 500 }
    );
  }
}
