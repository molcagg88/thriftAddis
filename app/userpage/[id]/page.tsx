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
  // layout already gives us a min‑height and handles bottom padding for the
  // fixed navigation bar. an extra `min-h-screen` here triggered a resize
  // during hydration/viewport changes which was the cause of the “fling to the
  // top” behaviour on this route.
  return <SellerProfile seller={seller} />;
}
