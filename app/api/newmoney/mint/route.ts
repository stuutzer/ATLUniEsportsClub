import { NextResponse } from "next/server";
import { NEWMONEY_DEFAULT_CHAIN, mintDNZDSettlement, normalizeMintAmount } from "@/lib/newmoney";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = normalizeMintAmount(body?.amount);

    if (amount === null) {
      return NextResponse.json(
        { error: "amount must be a number between 0.01 and 10000" },
        { status: 400 }
      );
    }

    const chain =
      typeof body?.chain === "string" && body.chain.trim()
        ? body.chain.trim()
        : NEWMONEY_DEFAULT_CHAIN;

    const settlement = await mintDNZDSettlement({ amount, chain });
    return NextResponse.json({ settlement });
  } catch (error) {
    const message = error instanceof Error ? error.message : "NewMoney settlement failed";
    const status = message.includes("NEWMONEY_API_KEY") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
