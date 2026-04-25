"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Home, Plane, Power, Gem, Shirt } from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";

const categories = [
  { id: "groceries", label: "Groceries", icon: ShoppingCart, prompt: "Show me groceries options" },
  { id: "home", label: "Home & Furniture", icon: Home, prompt: "Browse Home & Furniture items" },
  { id: "travel", label: "Travel & Leisure", icon: Plane, prompt: "Find Travel & Leisure deals" },
  { id: "electronics", label: "Electronics", icon: Power, prompt: "Shop Electronics" },
  { id: "jewellery", label: "Jewellery", icon: Gem, prompt: "Browse Jewellery" },
  { id: "fashion", label: "Clothes & Fashion", icon: Shirt, prompt: "Explore Clothes & Fashion" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function ShoppingCategories() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const { displayName } = useIdentity();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleCategory = (prompt: string) => {
    router.push(`/agent?q=${encodeURIComponent(prompt)}`);
  };

  const name = displayName
    ? displayName.startsWith("0x")
      ? `${displayName.slice(0, 6)}…`
      : displayName.split(".")[0]
    : "there";

  return (
    <div className="flex flex-col items-center w-full">
      {/* Greeting */}
      <div className="text-center mb-10">
        <p
          className="text-white/45 text-[13px] italic font-light mb-2"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
            transitionDelay: "60ms",
          }}
        >
          {getGreeting()}, {name}.
        </p>
        <h1
          className="text-white text-[28px] md:text-[32px] font-semibold tracking-tight"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
            transitionDelay: "130ms",
          }}
        >
          What&rsquo;s on our shopping list today?
        </h1>
      </div>

      {/* 2 × 3 grid of large tiles */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat.prompt)}
              className="group relative overflow-hidden rounded-xl bg-[#262626] border border-white/[0.04] py-9 px-6 flex items-center justify-center gap-3 text-center text-white/55 hover:text-white hover:bg-white/[0.04] transition-colors duration-200"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0) scale(1)" : "translateY(22px) scale(0.96)",
                transition: [
                  `opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${200 + i * 70}ms`,
                  `transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${200 + i * 70}ms`,
                  "background-color 0.2s ease",
                  "color 0.2s ease",
                ].join(", "),
              }}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="text-[15px] font-medium">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
