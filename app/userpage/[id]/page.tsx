// app/seller/[id]/page.tsx
import { SellerProfile } from "@/components/marketplace/seller-profile";
import { getSellerProfile } from "@/lib/data"; // Your Supabase fetcher
import { Profile } from "@/types";
import { notFound } from "next/navigation";

export default async function SellerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // 1. Fetch data directly on the server
  const seller: Profile | null = await getSellerProfile(id);
  if (!seller) {
    notFound();
  }
  return (
    <div className="min-h-screen bg-white">
      <SellerProfile seller={seller} />
    </div>
  );
}
