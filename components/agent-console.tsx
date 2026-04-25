"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, Loader2 } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { ShoppingCategories } from "@/components/shopping-categories";
import { cn } from "@/lib/utils";

interface AgentRunResponse {
  model: string;
  output: string;
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
          <div className="mx-auto w-full max-w-3xl">
            <div className="rounded-2xl border border-white/[0.06] bg-[#161616] p-6">
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
