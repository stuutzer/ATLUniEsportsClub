// app/agent/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { IdentityBanner } from "@/components/identity-banner";
import { ProductCard } from "@/components/product-card";
import { ShoppingCategories } from "@/components/shopping-categories";
import { ArrowUp, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/mockData";

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

const INITIAL_MESSAGES: Message[] = [];

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setShowCategories(false);

    const history = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const textBlock = data.content?.find((b: { type: string; text?: string }) => b.type === "text");
      const raw = textBlock?.text ?? "";
      if (!raw) throw new Error("Empty response");

      let assistantMsg: Message;
      try {
        const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(clean);
        assistantMsg = {
          role: "assistant",
          content: parsed.message ?? "Here's what I found:",
          products: parsed.products ?? [],
        };
      } catch {
        assistantMsg = { role: "assistant", content: raw.trim() };
      }

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Try again?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      {/* Scrollable message feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

          {/* Categories home state — shown until first message */}
          {showCategories && (
            <ShoppingCategories onSelect={(label) => sendMessage(`Show me ${label} products`)} />
          )}

          {messages.map((msg, i) => (
            <div key={i} className="space-y-4">

              {/* User message */}
              {msg.role === "user" && (
                <div className="flex justify-end">
                  <div className="flex items-end gap-2.5 max-w-[75%]">
                    <div className="bg-[#1e1e1e] border border-white/[0.07] text-white/90 text-sm leading-relaxed px-4 py-3 rounded-2xl rounded-br-sm">
                      {msg.content}
                    </div>
                    <div className="w-7 h-7 rounded-full flex-shrink-0 bg-white/8 flex items-center justify-center mb-0.5">
                      <User className="w-3.5 h-3.5 text-white/40" />
                    </div>
                  </div>
                </div>
              )}

              {/* Assistant message */}
              {msg.role === "assistant" && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 bg-purple-600/20 flex items-center justify-center mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="text-white/80 text-sm leading-relaxed pt-1">
                      {msg.content}
                    </p>

                    {/* Product grid inline */}
                    {msg.products && msg.products.length > 0 && (
<div
  className="grid gap-3 items-stretch"
  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
>
                        {msg.products.map((product, j) => (
                          <div
                            key={product.id}
                            style={{
                              opacity: 0,
                              animation: `fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) ${j * 55}ms forwards`,
                            }}
                          >
                            <ProductCard product={product} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full flex-shrink-0 bg-purple-600/20 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 mt-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar fixed to bottom */}
      <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#0a0a0a] px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div
            className={cn(
              "flex items-end gap-3 rounded-2xl px-4 py-3",
              "bg-[#1c1c1c] border border-white/10",
              "focus-within:border-purple-500/40 transition-all"
            )}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything…"
              className="flex-1 bg-transparent text-white placeholder:text-white/25 text-sm focus:outline-none resize-none leading-relaxed"
              style={{ maxHeight: "160px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center hover:bg-purple-700 disabled:opacity-30 transition-all flex-shrink-0 mb-0.5"
            >
              <ArrowUp className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-center text-white/15 text-xs mt-2">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}