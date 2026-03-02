// app/profile/[id]/page.tsx
import EditProfile from "@/components/ui/sections/EditProfile";
import { getSellerProfile, getSellerListings } from "@/lib/data"; // Supabase fetcher
import { Profile } from "@/types";
import { notFound } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const seller: Profile | null = await getSellerProfile(id);
  if (!seller) {
    notFound();
  }

  // load seller's own listings so they can review/edit them
  const listings = await getSellerListings(id);

  return <EditProfile seller={seller} listings={listings} />;
}
