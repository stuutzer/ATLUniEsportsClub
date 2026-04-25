// components/shopping-categories.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Home, Plane, Monitor, Gem, Shirt } from "lucide-react";

const categories = [
  { id: "groceries", label: "Groceries", icon: ShoppingCart, prompt: "Show me groceries options" },
  { id: "home", label: "Home & Furniture", icon: Home, prompt: "Browse Home & Furniture items" },
  { id: "travel", label: "Travel & Leisure", icon: Plane, prompt: "Find Travel & Leisure deals" },
  { id: "electronics", label: "Electronics", icon: Monitor, prompt: "Shop Electronics" },
  { id: "jewellery", label: "Jewellery", icon: Gem, prompt: "Browse Jewellery" },
  { id: "fashion", label: "Clothes & Fashion", icon: Shirt, prompt: "Explore Clothes & Fashion" },
];

export function ShoppingCategories() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleCategory = (prompt: string) => {
    router.push(`/agent?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="flex flex-col items-center px-4 py-8 w-full">
      {/* Greeting */}
      <div className="text-center mb-8">
        <p
          className="text-white/40 text-xs tracking-wide font-light mb-1.5"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
            transitionDelay: "60ms",
          }}
        >
          Good morning, Justin.
        </p>
        <p
          className="text-white text-xl font-medium tracking-tight"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
            transitionDelay: "130ms",
          }}
        >
          What's on our shopping list today?
        </p>
      </div>

      {/* Grid — full width, 2 cols */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat.prompt)}
              className="group relative overflow-hidden rounded-2xl bg-[#1c1c1c] border border-white/5 p-5 flex items-center gap-3.5 text-left hover:border-purple-500/30 hover:bg-[#212121] active:scale-[0.97] w-full"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0) scale(1)" : "translateY(22px) scale(0.96)",
                transition: [
                  `opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${200 + i * 80}ms`,
                  `transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${200 + i * 80}ms`,
                  "background 0.2s ease",
                  "border-color 0.25s ease",
                  "scale 0.15s ease",
                ].join(", "),
              }}
            >
              {/* Icon bubble */}
              <div className="w-10 h-10 min-w-[40px] rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/18 transition-colors duration-300">
                <Icon className="w-[19px] h-[19px] text-purple-400 transition-transform duration-300 group-hover:scale-110" />
              </div>

              {/* Label */}
              <span className="text-white/85 text-sm font-medium leading-snug">
                {cat.label}
              </span>

              {/* Corner glow orb */}
              <div
                className="pointer-events-none absolute -right-5 -bottom-5 w-20 h-20 rounded-full bg-purple-600/10 blur-2xl"
                style={{
                  opacity: 0,
                  transition: "opacity 0.35s ease",
                }}
                ref={(el) => {
                  if (!el) return;
                  const btn = el.closest("button")!;
                  btn.addEventListener("mouseenter", () => (el.style.opacity = "1"));
                  btn.addEventListener("mouseleave", () => (el.style.opacity = "0"));
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}