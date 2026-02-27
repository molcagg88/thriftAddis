"use client";

import { ArrowLeft, Instagram, MessageCircle } from "lucide-react";
import { Profile, Listing } from "@/types";
import ProductCard from "@/components/marketplace/product-card";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SellerProfileUIProps {
  seller: Profile;
  listings: Listing[];
}
export default function SellerProfileUI({
  seller,
  listings,
}: SellerProfileUIProps) {
  const router = useRouter();
  // drop the extra min-h-screen; the parent layout already stretches the
  // viewport and provides the padding for the bottom nav. avoiding duplicate
  // height rules stops layout jitter when the fixed footer appears/disappears.
  return (
    <div>
      {/* Back button – use router.back() so we return to whatever page the
          visitor came from instead of always jumping to `/` (which forces a
          scroll-to-top). render as a button so it can't be accidentally
          focused/activated while scrolling. */}
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <button
        type="button"
        onClick={() => router.back()}
        className="fixed top-4 left-4 md:top-6 md:left-6 z-40 p-2 md:p-3 border-2 border-green-600 bg-white hover:bg-green-50 transition-colors"
      >
        <ArrowLeft size={24} className="text-green-600" />
      </button>

      {/* Seller Header */}
      <section className="pt-20 md:pt-8 px-4 md:px-6 py-8 md:py-12 bg-white border-b-2 border-green-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Avatar */}
          <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 border-2 border-green-600 flex items-center justify-center bg-gray-100 text-5xl">
            Profile-Picture:{seller.avatar_url}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {seller.display_name}
            </h1>
            <p className="text-base md:text-lg text-green-600 font-bold mb-3">
              {seller.username}
            </p>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              {seller.bio}
            </p>

            {/* Contact Buttons */}
            <div className="flex flex-col gap-3">
              <button className="w-full md:w-auto px-6 py-3 border-2 border-green-600 bg-white text-green-600 font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                <MessageCircle size={20} />
                Contact on WhatsApp
              </button>
              <button className="w-full md:w-auto px-6 py-3 border-2 border-green-600 bg-white text-green-600 font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                <Instagram size={20} />
                Follow on Instagram
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Seller's Products */}
      <section className="px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-8 border-b-2 border-green-600 pb-4">
            {seller.display_name}'s Shop
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {listings.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                sellerName={seller.display_name || "User"}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
