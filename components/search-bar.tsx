// components/search-bar.tsx
"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/mockData";

interface SearchBarProps {
  onResults: (products: Product[]) => void;
  onLoading: (loading: boolean) => void;
  onQuery?: (query: string) => void;
}

export function SearchBar({ onResults, onLoading, onQuery }: SearchBarProps) {
  const [query, setQuery] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    onLoading(true);
    onResults([]);
    onQuery?.(query.trim());

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a shopping agent. When the user asks for products, respond ONLY with a valid JSON array of product objects. No markdown, no explanation, just raw JSON.

Each product object must have exactly these fields:
{
  "id": string (unique, e.g. "prod-1"),
  "name": string,
  "category": string (uppercase, e.g. "COMPUTING", "PERIPHERALS", "DISPLAYS", "AUDIO", "STORAGE"),
  "merchantName": string,
  "price": number,
  "imageUrl": string (use https://picsum.photos/seed/{uniqueSeedWord}/600/450),
  "tier": "S" | "A" | "B",
  "acceptedCrypto": array containing any of "ETH", "AVAX", "USDC"
}

Return 6 products relevant to what the user asked for. Assign tiers based on quality/price (S = premium, A = great, B = good).`,
          messages: [{ role: "user", content: query }],
        }),
      });

      const data = await response.json();
      const text = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      const products: Product[] = JSON.parse(clean);
      onResults(products);
    } catch (err) {
      console.error("Agent search failed:", err);
      onResults([]);
    } finally {
      onLoading(false);
    }
  }

  return (
    <div className="fixed bottom-0 left-[220px] right-0 pb-6 pt-10 flex justify-center z-40 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pointer-events-none">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "w-[60%] flex items-center gap-3 pointer-events-auto",
          "bg-[#1c1c1c] border border-white/10 rounded-full px-5 py-3",
          "focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all"
        )}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What did you want to purchase today?"
          className="flex-1 bg-transparent text-white placeholder:text-white/30 text-sm focus:outline-none"
        />
        <button
          type="submit"
          className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center hover:bg-purple-700 transition-colors flex-shrink-0"
        >
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
}