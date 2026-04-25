"use client";

import { useEffect, useRef, useState } from "react";
import { mockAgentLog, type AgentLog } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Search, ArrowUpDown, Star, Info } from "lucide-react";

const logIcons: Record<AgentLog["type"], React.ReactNode> = {
  search: <Search className="w-3 h-3" />,
  compare: <ArrowUpDown className="w-3 h-3" />,
  rank: <Star className="w-3 h-3" />,
  info: <Info className="w-3 h-3" />,
};

const logColors: Record<AgentLog["type"], string> = {
  search: "text-blue-400 bg-blue-400/10",
  compare: "text-yellow-400 bg-yellow-400/10",
  rank: "text-purple-400 bg-purple-400/10",
  info: "text-white/50 bg-white/5",
};

export function AgentFeed() {
  const [visibleLogs, setVisibleLogs] = useState<AgentLog[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Simulate streaming logs one by one
  useEffect(() => {
    setVisibleLogs([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i < mockAgentLog.length) {
        setVisibleLogs((prev) => [...prev, mockAgentLog[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 700);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleLogs]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-white/10 bg-white/3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-white/60 uppercase tracking-widest font-medium">
          Agent Live Feed
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {visibleLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3 text-sm animate-fade-in"
          >
            <span className="text-white/30 font-mono text-xs mt-0.5 flex-shrink-0">
              {log.timestamp}
            </span>
            <span
              className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                logColors[log.type]
              )}
            >
              {logIcons[log.type]}
            </span>
            <span className="text-white/80 leading-relaxed">{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
