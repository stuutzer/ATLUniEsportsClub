"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: (query: string) => void;
  loading?: boolean;
}

export function SearchBar({
  query,
  onQueryChange,
  onSubmit,
  loading = false,
}: SearchBarProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(query);
  }

  return (
    <div className="fixed bottom-0 left-[260px] right-0 z-40 flex justify-center bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/85 to-transparent pb-7 pt-12 pointer-events-none">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "w-[70%] max-w-3xl flex items-center gap-3 pointer-events-auto",
          "bg-[#202020] border border-white/[0.06] rounded-full pl-6 pr-2 py-2",
          "focus-within:border-white/15 transition-colors"
        )}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="What did you want to purchase today?"
          className="flex-1 bg-transparent text-white placeholder:text-white/35 text-[15px] py-2 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.14] flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50"
          aria-label="Send"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 text-white/80 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4 text-white/80" />
          )}
        </button>
      </form>
    </div>
  );
}
