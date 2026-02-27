"use client";

import { useState } from "react";
import { Edit, Heart } from "lucide-react";
import Link from "next/link";
import { Listing } from "@/types";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

interface ProductCardProps {
  product: Listing;
  sellerName: string;
}

export default function ProductCard({ product, sellerName }: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const imageUrl = product.image_urls[0];
  const { user } = useUser(); // Destructured for cleaner access

  return (
    <div className="group relative border-2 border-green-600 hover:shadow-[4px_4px_0px_0px_rgba(22,163,74,1)] transition-shadow bg-white">
      {/* 1. THE STRETCHED LINK: Covers the whole card */}
      <Link
        href={`/listing/${product.id}`}
        className="absolute inset-0 z-0"
        aria-label={`View details for ${product.title}`}
      />

      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={`${product.title}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* 2. LIKE BUTTON: Needs relative and z-10 to stay clickable on top of the link */}
        <button
          onClick={(e) => {
            e.preventDefault(); // Prevents the stretched link from triggering
            setLiked(!liked);
          }}
          className="relative z-10 top-2 right-2 p-2 bg-white border-2 border-green-600 hover:bg-green-50 transition-colors"
        >
          <Heart
            size={18}
            className={`transition-colors ${liked ? "fill-green-600 text-green-600" : "text-green-600"}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4 border-t-2 border-green-600 relative z-10 pointer-events-none">
        {/* Price */}
        <div className="text-xl md:text-2xl font-bold text-green-600 mb-2">
          ${product.price}
        </div>

        {/* Title */}
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Wrapper for interactive elements to re-enable pointer events */}
        <div className="flex items-center justify-between pointer-events-auto">
          {/* Seller Name */}
          <Link
            href={`/userpage/${product.user_id}`}
            className="text-xs md:text-sm text-green-600 font-bold hover:underline"
          >
            {sellerName}
          </Link>

          {/* Edit Button */}
          {user?.id === product.user_id && (
            <Link
              href={`/listing/edit/${product.id}`}
              className="p-1.5 hover:bg-gray-200 transition-colors rounded"
            >
              <Edit size={20} className="text-green-600" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
