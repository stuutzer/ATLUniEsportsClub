"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { ShoppingCategories } from "@/components/shopping-categories";
import { ProductCard } from "@/components/product-card";
import type { AgentRecommendation } from "@/lib/agent-types";
import { cn } from "@/lib/utils";

interface AgentRunResponse {
  model: string;
  output: string;
  recommendations: AgentRecommendation[];
}

function RecommendationSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#141414] animate-pulse"
        >
          <div className="aspect-[4/3] bg-white/5" />
          <div className="space-y-3 p-4">
            <div className="h-2 w-20 rounded bg-white/5" />
            <div className="h-4 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-white/5" />
            <div className="h-9 rounded-lg bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AgentConsole() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(q);
  const [result, setResult] = useState<AgentRunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  useEffect(() => {
    if (!q) {
      setResult(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function runAgent() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/agent/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: q }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error ?? "Agent request failed");
        }

        if (!cancelled) {
          setResult(data);
        }
      } catch (runError) {
        if (!cancelled) {
          setResult(null);
          setError(
            runError instanceof Error ? runError.message : "Agent request failed"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    runAgent();

    return () => {
      cancelled = true;
    };
  }, [q]);

  function handleSubmit(nextQuery: string) {
    const trimmed = nextQuery.trim();

    if (!trimmed) {
      router.push("/agent");
      return;
    }

    router.push(`/agent?q=${encodeURIComponent(trimmed)}`);
  }

  const showEmptyState = !q && !loading && !result && !error;

  return (
    <>
      <div
        className={cn(
          "flex-1 px-6 pb-40",
          showEmptyState
            ? "flex items-center justify-center"
            : "overflow-y-auto pt-10"
        )}
      >
        {showEmptyState ? (
          <ShoppingCategories />
        ) : (
          <div className="mx-auto w-full max-w-6xl space-y-5">
            <div className="max-w-3xl rounded-2xl border border-white/[0.06] bg-[#161616] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    loading ? "bg-purple-500/10" : "bg-white/5"
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-purple-300" />
                  ) : (
                    <Bot className="h-5 w-5 text-white/70" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{q}</p>
                  <p className="text-xs text-white/35">
                    {loading
                      ? "Running agent with MCP tools"
                      : result
                      ? `Model: ${result.model}`
                      : "Request failed"}
                  </p>
                </div>
              </div>

              {loading && (
                <p className="text-sm leading-7 text-white/55">
                  Checking product options, merchant trust, pricing, and crypto
                  totals.
                </p>
              )}

              {error && (
                <p className="text-sm leading-7 text-red-300">{error}</p>
              )}

              {result && (
                <div className="whitespace-pre-wrap text-sm leading-7 text-white/75">
                  {result.output}
                </div>
              )}
            </div>

            {result && result.recommendations.length > 0 && (
              <div className="max-w-5xl space-y-4 pt-1">
                <div className="flex items-center justify-between gap-3 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-300" />
                    <span>Recommended products</span>
                  </div>
                  <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-purple-200">
                    {result.recommendations.length} picks
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {result.recommendations.map((recommendation) => (
                    <div
                      key={recommendation.product.id}
                      className="w-full max-w-[320px] space-y-2"
                    >
                      <ProductCard product={recommendation.product} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="mt-5">
                <RecommendationSkeleton />
              </div>
            )}
          </div>
        )}
      </div>

      <SearchBar
        query={query}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </>
  );
}
