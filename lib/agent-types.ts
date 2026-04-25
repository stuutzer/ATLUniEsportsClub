import type { Product } from "@/lib/mockData";

export interface AgentRecommendation {
  product: Product;
  token: string;
  chain: string;
  totalUsd: number;
  subtotalUsd: number;
  shippingUsd: number;
  gasUsd: number;
  trustScore: number;
  score: number;
  reasoning: string[];
}

