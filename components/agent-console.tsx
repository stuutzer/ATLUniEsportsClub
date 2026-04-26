"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, Loader2, Sparkles, Wallet, X } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { ShoppingCategories } from "@/components/shopping-categories";
import { ProductCard } from "@/components/product-card";
import type { AgentRecommendation } from "@/lib/agent-types";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";

interface AgentRunResponse {
  model: string;
  output: string;
  recommendations: AgentRecommendation[];
}

const AGENT_RESULT_CACHE_PREFIX = "quarter_agent_result:";

function WalletRequiredModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
    >
      <div
        className={cn(
          "relative w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#141414] p-8",
          "shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        )}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/60"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200/20 bg-sky-300/10 shadow-[0_0_32px_rgba(125,211,252,0.12)]">
            <Wallet className="h-6 w-6 text-sky-200" />
          </div>
        </div>

        {/* Text */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-base font-semibold text-white">
            Wallet Required
          </h2>
          <p className="text-sm leading-relaxed text-white/45">
            Connect your wallet and set up your profile to start searching and purchasing with your AI agent.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => { onClose(); router.push("/wallet"); }}
            className={cn(
              "w-full rounded-full py-2.5 text-sm font-semibold",
              "bg-sky-200 text-[#06131d]",
              "transition-[background-color,transform,box-shadow] duration-200",
              "hover:bg-sky-100 hover:-translate-y-px",
              "shadow-[0_8px_24px_rgba(125,211,252,0.18)]"
            )}
          >
            Set Up Wallet
          </button>
          <button
            onClick={onClose}
            className={cn(
              "w-full rounded-full py-2.5 text-sm font-medium text-white/50",
              "border border-white/[0.08] bg-transparent",
              "transition-[background-color,color] duration-200",
              "hover:bg-white/[0.05] hover:text-white/75"
            )}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
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

function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}

function AgentMarkdown({ content }: { content: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = content.split(/\r?\n/);
  let listItems: { text: string; indent: number }[] = [];

  function flushList() {
    if (listItems.length === 0) return;

    blocks.push(
      <ul key={`list-${blocks.length}`} className="my-3 space-y-1.5">
        {listItems.map((item, index) => (
          <li
            key={`${item.text}-${index}`}
            className="flex gap-2 text-sm leading-7 text-white/75"
            style={{ marginLeft: item.indent * 14 }}
          >
            <span className="mt-[0.8em] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-200/70" />
            <span>{renderInlineMarkdown(item.text)}</span>
          </li>
        ))}
      </ul>
    );

    listItems = [];
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    const bulletMatch = line.match(/^(\s*)-\s+(.+)$/);
    if (bulletMatch) {
      listItems.push({
        text: bulletMatch[2],
        indent: Math.floor(bulletMatch[1].length / 2),
      });
      return;
    }

    flushList();

    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3
          key={`heading-${blocks.length}`}
          className="mb-2 mt-4 text-base font-semibold text-white first:mt-0"
        >
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    blocks.push(
      <p key={`paragraph-${blocks.length}`} className="my-2 text-sm leading-7 text-white/75">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });

  flushList();

  return <div>{blocks}</div>;
}

export function AgentConsole() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const { isConnected } = useAccount();

  const [query, setQuery] = useState(q);
  const [result, setResult] = useState<AgentRunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    if (!q) setQuery("");
  }, [q]);

  useEffect(() => {
    if (!q) {
      setResult(null);
      setError(null);
      return;
    }

    const cacheKey = `${AGENT_RESULT_CACHE_PREFIX}${q}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as AgentRunResponse;
        setResult(parsed);
        setError(null);
        setLoading(false);
        return;
      } catch {
        sessionStorage.removeItem(cacheKey);
      }
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
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
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

    if (!isConnected) {
      setShowWalletModal(true);
      return;
    }

    router.push(`/agent?q=${encodeURIComponent(trimmed)}`);
    setQuery("");
  }

  const showEmptyState = !q && !loading && !result && !error;

  return (
    <>
      {showWalletModal && (
        <WalletRequiredModal onClose={() => setShowWalletModal(false)} />
      )}
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
                    loading ? "bg-sky-300/10" : "bg-white/5"
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-sky-200" />
                  ) : (
                    <Bot className="h-5 w-5 text-white/70" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{q}</p>
                  <p className="text-xs text-white/35">
                    {loading
                      ? "Running agent with AI SDK tools"
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
                <AgentMarkdown content={result.output} />
              )}
            </div>

            {result && result.recommendations.length > 0 && (
              <div className="max-w-5xl space-y-4 pt-1">
                <div className="flex items-center justify-between gap-3 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-sky-200" />
                    <span>Recommended products</span>
                  </div>
                  <span className="rounded-full border border-sky-200/25 bg-sky-300/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-sky-200">
                    {result.recommendations.length} picks
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {result.recommendations.map((recommendation) => (
                    <div
                      key={recommendation.product.id}
                      className="w-full max-w-[320px] space-y-2"
                    >
                      <ProductCard
                        product={recommendation.product}
                        recommendation={recommendation}
                      />
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
