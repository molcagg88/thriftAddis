"use client";

import ProductCard from "@/components/marketplace/product-card";
import { ListingWithProfile } from "@/types";

interface ProductGridUIProps {
  listings: ListingWithProfile[];
}

export default function ProductGridUI({ listings }: ProductGridUIProps) {
  return (
    <section className="px-4 py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-8 border-b-2 border-green-600 pb-4">
          New Listings
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {listings.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              sellerName={product.profiles.display_name}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
