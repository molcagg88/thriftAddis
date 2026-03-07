"use client";

import { Edit, Instagram, MessageCircle, Heart } from "lucide-react";
import BackButton from "@/components/buttons/BackButton";
import { useState } from "react";
import ProductCard from "@/components/marketplace/product-card";
import ProfileHeader from "@/components/ui/sections/ProfileHeader";
import { Profile, Listing } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import SellerProductCard from "@/components/marketplace/Seller-product-card ";

interface SellerProfileUIProps {
  seller: Profile;
  listings: Listing[];
}
export default function SellerProfileUI({
  seller,
  listings,
}: SellerProfileUIProps) {
  const router = useRouter();
  const user = useUser().user;
  const isOwner = user?.id === seller.id;
  const [followed, setFollowed] = useState(false);
  // drop the extra min-h-screen; the parent layout already stretches the
  // viewport and provides the padding for the bottom nav. avoiding duplicate
  // height rules stops layout jitter when the fixed footer appears/disappears.
  return (
    <div>
      <ProfileHeader
        seller={seller}
        showEdit={isOwner}
        editHref={`/profile/${user?.id}`}
      />

      {/* Back button – use router.back() so we return to whatever page the
          visitor came from instead of always jumping to `/` (which forces a
          scroll-to-top). render as a button so it can't be accidentally
          focused/activated while scrolling. */}
      <BackButton variant="floating" />

      {/* Seller's Products */}
      <section className="px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-8 border-b-2 border-green-600 pb-4">
            {seller.display_name}'s Shop
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {listings.map((product) => (
              <SellerProductCard
                key={product.id}
                product={product}
                seller={seller}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
