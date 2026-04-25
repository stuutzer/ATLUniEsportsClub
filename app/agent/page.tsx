import { SearchBar } from "@/components/search-bar";
import { IdentityBanner } from "@/components/identity-banner";
import { Zap } from "lucide-react";

// TODO: populate with AI agent search results
const EMPTY_CARDS = Array.from({ length: 6 });

export default function AgentPage() {
  return (
    <div className="flex flex-col min-h-screen pb-36">

      {/* Identity status banner */}
      <IdentityBanner />

      {/* Hero */}
      <div className="flex flex-col items-center text-center pt-14 pb-14 px-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-7 tracking-wide">
          <Zap className="w-3 h-3" />
          AI-Powered Web3 Shopping
        </div>

        <h1 className="text-5xl font-bold text-white leading-tight mb-5 max-w-2xl">
          Your AI Agent.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            Your Wallet.
          </span>
          <br />
          Every Purchase.
        </h1>

        <p className="text-white/40 text-base max-w-md leading-relaxed">
          Let your autonomous agent find, rank, and buy the best products —
          paying in crypto with the lowest fees.
        </p>
      </div>

      {/* Results grid */}
      <div className="px-10">
        <p className="text-xs text-white/20 uppercase tracking-widest mb-4 pl-1">
          Agent Results
        </p>
        <div className="grid grid-cols-3 gap-3 max-w-[960px] mx-auto">
          {/* TODO: populate with AI agent search results */}
          {EMPTY_CARDS.map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-[#141414] border border-white/[0.06] h-[140px]"
            />
          ))}
        </div>
      </div>

      {/* Search bar fixed to bottom */}
      <SearchBar />
    </div>
  );
}
