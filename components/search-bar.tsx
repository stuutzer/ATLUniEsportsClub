"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: trigger Claude API agent search
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
