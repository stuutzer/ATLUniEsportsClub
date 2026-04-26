"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  PackageSearch,
  ShoppingCart,
  Trash2,
  TrendingDown,
  XCircle,
} from "lucide-react";
import {
  ORDER_TYPE_LABELS,
  useOrders,
  type Order,
  type OrderStatus,
  type OrderType,
} from "@/context/OrdersContext";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<OrderType, React.ComponentType<{ className?: string }>> = {
  unreleased: CalendarClock,
  "price-drop": TrendingDown,
  availability: PackageSearch,
};

const STATUS_STYLE: Record<
  OrderStatus,
  { label: string; chip: string; ring: string }
> = {
  pending: {
    label: "Watching",
    chip: "bg-amber-300/10 text-amber-200",
    ring: "ring-amber-300/25",
  },
  ready: {
    label: "Ready",
    chip: "bg-emerald-300/10 text-emerald-200",
    ring: "ring-emerald-300/25",
  },
  fulfilled: {
    label: "Fulfilled",
    chip: "bg-sky-300/10 text-sky-200",
    ring: "ring-sky-300/25",
  },
  cancelled: {
    label: "Cancelled",
    chip: "bg-white/[0.05] text-white/45",
    ring: "ring-white/10",
  },
};

const FILTERS: { id: "active" | "all" | OrderStatus; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "ready", label: "Ready" },
  { id: "fulfilled", label: "Fulfilled" },
  { id: "cancelled", label: "Cancelled" },
  { id: "all", label: "All" },
];

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export default function OrdersPage() {
  const { orders, cancelOrder, removeOrder, markReady, markFulfilled } = useOrders();
  const { addItem } = useCart();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("active");

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "active") {
      return orders.filter((o) => o.status === "pending" || o.status === "ready");
    }
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const handleMoveToCart = (order: Order) => {
    addItem(order.product);
    markFulfilled(order.id);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        href="/agent"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Agent
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
          <ClipboardList className="h-5 w-5 text-white/75" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Your Orders</h1>
          <p className="text-sm text-white/45">
            Standing requests Quarter is watching for you.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const count =
            f.id === "all"
              ? orders.length
              : f.id === "active"
              ? orders.filter((o) => o.status === "pending" || o.status === "ready").length
              : orders.filter((o) => o.status === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "quarter-button px-3.5 py-1.5 text-xs",
                active
                  ? "bg-white/10 text-white"
                  : "bg-white/[0.02] text-white/55"
              )}
            >
              {f.label}
              <span className="ml-1.5 text-[10px] text-white/35">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-12 text-center">
          <ClipboardList className="mx-auto mb-4 h-10 w-10 text-white/15" />
          <p className="text-white/55">
            {orders.length === 0
              ? "You haven't placed any orders yet."
              : "No orders match this filter."}
          </p>
          {orders.length === 0 && (
            <Link
              href="/agent"
              className="quarter-button mt-5 px-5 py-2"
            >
              Browse products
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const Icon = TYPE_ICON[order.type];
            const status = STATUS_STYLE[order.status];
            const isActive = order.status === "pending" || order.status === "ready";

            return (
              <div
                key={order.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-[#121212] p-4 sm:flex-row"
              >
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#1a1a1a]">
                  <img
                    src={order.product.imageUrl}
                    alt={order.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                        status.chip,
                        status.ring
                      )}
                    >
                      {status.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-white/40">
                      <Icon className="h-3 w-3" />
                      {ORDER_TYPE_LABELS[order.type]}
                    </span>
                    <span className="text-[10px] text-white/30">
                      • placed {formatRelative(order.createdAt)}
                    </span>
                  </div>

                  <h3 className="mt-1.5 truncate text-sm font-semibold text-white/90">
                    {order.product.name}
                  </h3>
                  <p className="text-xs text-white/45">{order.product.merchantName}</p>

                  <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs">
                    <span className="text-white/55">
                      Current ${order.product.price.toFixed(2)}
                    </span>
                    {order.type === "price-drop" && order.targetPrice != null && (
                      <span className="text-emerald-200/85">
                        Target ${order.targetPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {order.note && (
                    <p className="mt-2 text-[11px] italic text-white/45">
                      “{order.note}”
                    </p>
                  )}
                  {order.commitmentHash && (
                    <p className="mt-1.5 text-[10px] font-mono text-white/30 break-all">
                      Commitment {order.commitmentHash.slice(0, 10)}…{order.commitmentHash.slice(-8)}
                    </p>
                  )}
                </div>

                <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-end">
                  {order.status === "ready" && (
                    <button
                      onClick={() => handleMoveToCart(order)}
                      className="quarter-button px-3 py-1.5 text-xs"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Move to cart
                    </button>
                  )}
                  {order.status === "pending" && (
                    <button
                      onClick={() => markReady(order.id)}
                      title="Demo: simulate the watch trigger firing"
                      className="quarter-button px-3 py-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark ready
                    </button>
                  )}
                  {isActive && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="quarter-button px-3 py-1.5 text-xs"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  )}
                  {!isActive && (
                    <button
                      onClick={() => removeOrder(order.id)}
                      className="quarter-button px-3 py-1.5 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
