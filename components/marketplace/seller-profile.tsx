import { ArrowLeft, MessageCircle, Instagram } from "lucide-react";
import { ProductCard } from "./product-card";
import { getSellerListings, getSellerProfile } from "@/lib/data";
import SellerProfileUI from "../ui/sections/SellerProfileUI";
import { Listing, Profile } from "@/types";
import { notFound } from "next/navigation";

interface SellerProfileProps {
  seller: Profile;
}

export async function SellerProfile({ seller }: SellerProfileProps) {
  const listings: Listing[] = await getSellerListings(seller.id);
  if (!seller) {
    notFound();
  }
  return <SellerProfileUI listings={listings} seller={seller} />;
}
