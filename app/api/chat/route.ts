import { NextRequest, NextResponse } from "next/server";

const PRODUCT_IMAGES: Record<string, string[]> = {
    AUDIO: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=450&fit=crop",
    ],
    COMPUTING: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=450&fit=crop",
    ],
    PERIPHERALS: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1615750173599-31e85782a7a8?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1563297007-0686b7003af7?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1601445638532-3b6313b9b6c5?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=600&h=450&fit=crop",
    ],
    DISPLAYS: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1593640408182-31c228b29976?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600&h=450&fit=crop",
    ],
    STORAGE: [
        "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1618410320928-25228d811631?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1600348712270-0a8f39541b1c?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1640955014216-75201056c829?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=600&h=450&fit=crop",
    ],
    ACCESSORIES: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1625772452888-01ede7b3ba7f?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=450&fit=crop",
    ],
};

function getImage(category: string, index: number): string {
    const images = PRODUCT_IMAGES[category] ?? PRODUCT_IMAGES["ACCESSORIES"];
    return images[index % images.length];
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                max_tokens: 1000,
                messages: [
                    {
                        role: "system",
                        content: `You are a friendly AI shopping agent. You help users find products to buy.

When the user asks for specific products or shopping recommendations, respond with ONLY a raw JSON object (no markdown, no backticks):
{
  "message": "your conversational reply here",
  "products": [
    {
      "id": "prod-1",
      "name": "Product Name",
      "category": "AUDIO",
      "merchantName": "Store Name",
      "price": 199.99,
      "tier": "S",
      "acceptedCrypto": ["ETH", "USDC"]
    }
  ]
}

Do NOT include imageUrl — images are handled server-side.
Return exactly 6 products. Tier must be "S", "A", or "B".
Category must be one of: COMPUTING, PERIPHERALS, DISPLAYS, AUDIO, STORAGE, ACCESSORIES.
acceptedCrypto must be from: ETH, AVAX, USDC.

For general chat (greetings, questions not about products), respond with plain text only — no JSON.`,
                    },
                    ...body.messages,
                ],
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("OpenAI error:", err);
            return NextResponse.json({ error: err }, { status: response.status });
        }

        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content ?? "";

        let text = raw;
        try {
            const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(clean);
            if (parsed.products) {
                parsed.products = parsed.products.map(
                    (p: { category: string }, i: number) => ({
                        ...p,
                        imageUrl: getImage(p.category, i),
                    })
                );
            }
            text = JSON.stringify(parsed);
        } catch {
            // plain text, pass through
        }

        return NextResponse.json({
            content: [{ type: "text", text }],
        });
    } catch (err) {
        console.error("Route error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}