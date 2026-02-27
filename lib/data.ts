import { Listing, ListingWithProfile, Profile } from "@/types";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * 1. Fetch all listings for the main feed
 */
export async function getListings(): Promise<ListingWithProfile[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      profiles (display_name, avatar_url) 
    `,
    ) // This "joins" the profile data so you have the seller's name!
    .neq("status", "closed")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
  return data;
}

/**
 * 2. Fetch a single seller's profile
 */
export async function getSellerProfile(
  userId: string,
): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single(); // We only expect one profile

  if (error) return null;
  return data;
}

/**
 * 3. Fetch all listings belonging to a specific seller
 */
export async function getSellerListings(userId: string): Promise<Listing[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}
