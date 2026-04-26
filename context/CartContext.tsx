"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/mockData";

const STORAGE_KEY = "quarter_cart";
export interface CartItem {
  product: Product;
  quantity: number;
  shippingUsd: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  addItem: (product: Product, quantity?: number, shippingUsd?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<Partial<CartItem> & { product: Product; quantity: number }>;
        setItems(
          parsed.map((item) => ({
            product: item.product,
            quantity: item.quantity,
            shippingUsd: item.shippingUsd ?? 0,
          }))
        );
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, quantity = 1, shippingUsd = 0) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity, shippingUsd }
            : i
        );
      }
      return [...prev, { product, quantity, shippingUsd }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const { itemCount, subtotal, shipping, total } = useMemo(() => {
    const itemCount = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );
    const shipping = items.reduce(
      (sum, i) => sum + (i.shippingUsd ?? 0) * i.quantity,
      0
    );
    return { itemCount, subtotal, shipping, total: subtotal + shipping };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shipping,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
