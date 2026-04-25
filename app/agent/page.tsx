"use client";

import { AgentFeed } from "@/components/agent-feed";
import { ProductCard } from "@/components/product-card";
import { mockProducts } from "@/lib/mockData";
import { Zap, RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Show only S and A tier products in agent results
const agentResults = mockProducts.filter((p) => p.tier === "S" || p.tier === "A").slice(0, 6);

export default function AgentPage() {
  const [key, setKey] = useState(0);

  function rerun() {
    setKey((k) => k + 1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-medium uppercase tracking-widest">Agent Active</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Agent Activity</h1>
        </div>
        <button
          onClick={rerun}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
            "bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white",
            "transition-all duration-200"
          )}
        >
          <RefreshCw className="w-4 h-4" />
          Re-run Agent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live feed */}
        <div className="rounded-xl bg-[#141414] border border-white/10 overflow-hidden" style={{ minHeight: 480 }}>
          <AgentFeed key={key} />
        </div>

        {/* Results summary */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-white/40 uppercase tracking-widest">
              {/* TODO: Replace with Claude API ranking */}
              Top Ranked Results
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agentResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
