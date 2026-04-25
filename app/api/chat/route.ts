// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

async function searchRealProducts(query: string): Promise<Product[]> {
    const response = await fetch(
        `https://real-time-product-search.p.rapidapi.com/search?q=${encodeURIComponent(query)}&country=us&language=en&limit=6`,
        {
            headers: {
                "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
                "X-RapidAPI-Host": "real-time-product-search.p.rapidapi.com",
            },
        }
    );

    if (!response.ok) throw new Error("Product search failed");
    const data = await response.json();

    // Merchants known to accept crypto
    const CRYPTO_MERCHANTS: Record<string, string[]> = {
        "newegg": ["ETH", "AVAX", "USDC"],
        "overstock": ["ETH", "USDC"],
        "shopify": ["ETH", "USDC"],
        "rakuten": ["USDC"],
        "microsoft": ["ETH"],
        "at&t": ["ETH", "USDC"],
        "whole foods": ["ETH"],
        "amazon": ["USDC"],
        "best buy": ["USDC"],
        "walmart": ["USDC"],
        "ebay": ["ETH", "USDC"],
    };

    function getCrypto(merchantName: string): string[] {
        const lower = merchantName.toLowerCase();
        for (const [key, tokens] of Object.entries(CRYPTO_MERCHANTS)) {
            if (lower.includes(key)) return tokens;
        }
        // Default — everyone "accepts" USDC for demo
        return ["USDC"];
    }

    function getTier(price: number): "S" | "A" | "B" {
        if (price > 500) return "S";
        if (price > 100) return "A";
        return "B";
    }

    function getCategory(title: string): string {
        const t = title.toLowerCase();
        if (t.match(/headphone|speaker|earbud|audio|microphone|soundbar/)) return "AUDIO";
        if (t.match(/laptop|pc|computer|desktop|processor|cpu|gpu/)) return "COMPUTING";
        if (t.match(/monitor|display|screen|tv/)) return "DISPLAYS";
        if (t.match(/keyboard|mouse|webcam|controller|gamepad/)) return "PERIPHERALS";
        if (t.match(/ssd|hard drive|storage|usb|memory|ram/)) return "STORAGE";
        if (t.match(/phone|tablet|ipad|iphone|samsung/)) return "MOBILE";
        if (t.match(/shoe|shirt|jacket|clothing|fashion|wear/)) return "FASHION";
        if (t.match(/chair|desk|furniture|lamp|home/)) return "HOME";
        if (t.match(/watch|ring|necklace|jewel/)) return "ACCESSORIES";
        return "ACCESSORIES";
    }

    return (data.data ?? []).slice(0, 6).map((item: RapidProduct, i: number) => {
        const price = parseFloat(item.typical_price_range?.[0]?.replace(/[^0-9.]/g, "") ?? "0") || parseFloat(item.offer?.price?.replace(/[^0-9.]/g, "") ?? "99");
        const merchant = item.offer?.store_name ?? item.sellers?.[0]?.name ?? "Amazon";

        return {
            id: `prod-${i}`,
            name: item.product_title ?? item.product_description ?? "Product",
            category: getCategory(item.product_title ?? ""),
            merchantName: merchant,
            price: isNaN(price) ? 99 : price,
            imageUrl: item.product_photos?.[0] ?? `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop`,
            tier: getTier(price),
            acceptedCrypto: getCrypto(merchant),
        };
    });
}

interface RapidProduct {
    product_title?: string;
    product_description?: string;
    product_photos?: string[];
    typical_price_range?: string[];
    offer?: { price?: string; store_name?: string };
    sellers?: { name?: string }[];
}

interface Product {
    id: string;
    name: string;
    category: string;
    merchantName: string;
    price: number;
    imageUrl: string;
    tier: "S" | "A" | "B";
    acceptedCrypto: string[];
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Step 1 — ask GPT what the user wants to search for
        const intentResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                max_tokens: 200,
                messages: [
                    {
                        role: "system",
                        content: `You are a shopping assistant. Given the user's message, respond with a JSON object:
{
  "isProductRequest": true/false,
  "searchQuery": "concise product search query for Google Shopping",
  "replyIfNotProduct": "friendly response if not a product request"
}

If the user is asking for products, set isProductRequest to true and provide a good search query.
If it's general chat, set isProductRequest to false and provide a friendly reply.
Respond ONLY with raw JSON.`,
                    },
                    ...body.messages,
                ],
            }),
        });

        const intentData = await intentResponse.json();
        const intentRaw = intentData.choices?.[0]?.message?.content ?? "{}";
        const intent = JSON.parse(intentRaw.replace(/```json|```/g, "").trim());

        // Step 2 — if not a product request, just return the chat reply
        if (!intent.isProductRequest) {
            return NextResponse.json({
                content: [{ type: "text", text: intent.replyIfNotProduct ?? "How can I help you shop today?" }],
            });
        }

        // Step 3 — fetch real products from RapidAPI
        let products: Product[] = [];
        try {
            products = await searchRealProducts(intent.searchQuery);
        } catch (err) {
            console.error("Product search failed:", err);
        }

        // Step 4 — ask GPT to write a nice message about the results
        const summaryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                max_tokens: 100,
                messages: [
                    {
                        role: "system",
                        content: "You are a friendly shopping agent. Write a single short sentence (max 15 words) introducing the product results. No markdown.",
                    },
                    {
                        role: "user",
                        content: `User asked for: "${intent.searchQuery}". Found ${products.length} products from merchants like ${[...new Set(products.map(p => p.merchantName))].slice(0, 3).join(", ")}.`,
                    },
                ],
            }),
        });

        const summaryData = await summaryResponse.json();
        const message = summaryData.choices?.[0]?.message?.content ?? "Here's what I found:";

        return NextResponse.json({
            content: [{
                type: "text",
                text: JSON.stringify({ message, products }),
            }],
        });

    } catch (err) {
        console.error("Route error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}