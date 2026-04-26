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

const STORAGE_KEY = "quarter_orders";

export type OrderType = "unreleased" | "price-drop" | "availability";
export type OrderStatus = "pending" | "ready" | "fulfilled" | "cancelled";

export interface Order {
  id: string;
  product: Product;
  type: OrderType;
  status: OrderStatus;
  createdAt: string;
  targetPrice?: number;
  note?: string;
  commitmentHash?: string;
}

interface PlaceOrderInput {
  product: Product;
  type: OrderType;
  targetPrice?: number;
  note?: string;
  commitmentHash?: string;
}

interface OrdersContextType {
  orders: Order[];
  pendingCount: number;
  placeOrder: (input: PlaceOrderInput) => Order;
  cancelOrder: (id: string) => void;
  removeOrder: (id: string) => void;
  markReady: (id: string) => void;
  markFulfilled: (id: string) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOrders(JSON.parse(raw) as Order[]);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  const placeOrder = useCallback((input: PlaceOrderInput): Order => {
    const order: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      product: input.product,
      type: input.type,
      status: "pending",
      createdAt: new Date().toISOString(),
      targetPrice: input.targetPrice,
      note: input.note,
      commitmentHash: input.commitmentHash,
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const cancelOrder = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o))
    );
  }, []);

  const removeOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const markReady = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "ready" } : o))
    );
  }, []);

  const markFulfilled = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "fulfilled" } : o))
    );
  }, []);

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === "pending" || o.status === "ready").length,
    [orders]
  );

  return (
    <OrdersContext.Provider
      value={{
        orders,
        pendingCount,
        placeOrder,
        cancelOrder,
        removeOrder,
        markReady,
        markFulfilled,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within an OrdersProvider");
  return ctx;
}

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  unreleased: "Pre-order (unreleased)",
  "price-drop": "Wait for price drop",
  availability: "Wait for availability",
};

export const ORDER_TYPE_DESCRIPTIONS: Record<OrderType, string> = {
  unreleased:
    "Reserve this item now. Quarter will check out the moment it launches.",
  "price-drop":
    "Quarter will watch the price and only buy when it drops to your target.",
  availability:
    "Out of stock — Quarter will buy as soon as the merchant restocks.",
};
