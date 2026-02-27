import { TopNav } from "@/components/marketplace/top-nav";
import { BottomNav } from "@/components/marketplace/bottom-nav";
import { HeroSection } from "@/components/marketplace/hero-section";
import { ProductGrid } from "@/components/marketplace/product-grid";

export default function Marketplace() {
  return (
    <div className="min-h-screen bg-white">
      <main className="pb-20 md:pb-0">
        <HeroSection />
        {/* The ProductGrid will now just contain <Link href={`/seller/${item.user_id}`}> */}
        <ProductGrid />
      </main>
    </div>
  );
}
