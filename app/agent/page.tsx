// app/agent/page.tsx
import { SearchBar } from "@/components/search-bar";
import { IdentityBanner } from "@/components/identity-banner";
import { ShoppingCategories } from "@/components/shopping-categories";

export default function AgentPage() {
  return (
    <div className="flex flex-col min-h-screen pb-36">
      <IdentityBanner />
      <ShoppingCategories />
      <SearchBar />
    </div>
  );
}