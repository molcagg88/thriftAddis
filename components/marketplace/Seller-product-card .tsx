"use client";

import { useState } from "react";
import { Edit, Heart, Tag, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Listing, ListingWithProfile, Profile } from "@/types";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

interface ProductCardProps {
  product: Listing;
  seller: Profile;
}

export default function SellerProductCard({
  product,
  seller,
}: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const { user } = useUser();
  const imageUrl = product.image_urls[0];

  // 1. SAFETY FILTER: If listing is "closed", don't render anything.
  // Note: You should also filter this in your Supabase '.neq("status", "closed")' query.
  if (product.status === "closed") return null;

  const isOwner = user?.id === product.user_id;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const tags = Array.isArray(product.tags)
    ? product.tags
    : product.tags?.split(",").filter((t) => t.trim()) || [];

  return (
    <div className="group relative bg-white border-[1.5px] md:border-2 border-green-600 hover:shadow-[4px_4px_0px_0px_rgba(22,163,74,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(22,163,74,1)] transition-all duration-200 flex flex-col h-full overflow-hidden">
      {/* STRETCHED LINK */}
      <Link
        href={`/listing/${product.id}`}
        className="absolute inset-0 z-0"
        aria-label={`View ${product.title}`}
      />

      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden border-b-[1.5px] md:border-b-2 border-green-600">
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-transform duration-500`}
        />

        {/* Floating Action Buttons */}
        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1.5 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              setLiked(!liked);
            }}
            className="p-1.5 md:p-2 bg-white border-[1.5px] border-green-600 shadow-[2px_2px_0px_0px_rgba(22,163,74,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <Heart
              size={16}
              className={`${liked ? "fill-red-500 text-red-500" : "text-green-600"}`}
            />
          </button>

          {isOwner && (
            <Link
              href={`/listing/edit/${product.id}`}
              className="p-1.5 md:p-2 bg-yellow-300 border-[1.5px] border-green-600 shadow-[2px_2px_0px_0px_rgba(22,163,74,1)] hover:bg-yellow-400 transition-all"
            >
              <Edit size={16} className="text-green-900" />
            </Link>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-2.5 md:p-4 flex flex-col flex-1 relative z-10 bg-white">
        {/* Price */}
        <div className="inline-block bg-green-600 text-white px-1.5 py-0.5 text-sm md:text-lg font-black italic w-fit mb-1">
          {formatPrice(product.price)}
        </div>

        {/* Title */}
        <h3 className="text-xs md:text-base font-bold text-gray-900 line-clamp-1 group-hover:text-green-600 transition-colors uppercase tracking-tight mb-1">
          {product.title}
        </h3>

        {/* Description - Hidden on small mobile to save space, shown on MD+ */}
        <p className="hidden md:line-clamp-2 text-xs text-gray-500 mb-3 leading-relaxed">
          {product.description}
        </p>

        {/* Tags - Compacted for Mobile */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="text-[9px] md:text-[10px] uppercase font-bold text-green-700 bg-green-50 px-1.5 py-0.5 border border-green-200 flex items-center gap-0.5"
            >
              <Tag size={8} className="md:w-[10px]" />
              {tag.trim()}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between overflow-hidden">
          <Link
            href={`/userpage/${product.user_id}`}
            className="flex items-center gap-1.5 group/seller min-w-0"
          >
            <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-50 border border-green-600 flex items-center justify-center">
              {!seller.avatar_url && (
                <UserIcon size={12} className="text-green-600 md:w-[14px]" />
              )}
              {seller.avatar_url && (
                <Image
                  src={seller.avatar_url}
                  alt={seller.display_name || "Seller Avatar"}
                  width={20}
                  height={20}
                  className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover"
                />
              )}
            </div>
            <span className="text-[10px] md:text-xs font-black text-gray-700 truncate group-hover/seller:text-green-600 uppercase">
              {seller.display_name || seller.username}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
