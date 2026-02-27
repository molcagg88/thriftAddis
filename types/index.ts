export interface Profile {
  id: string; // Clerk User ID
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  contact_info: {
    instagram?: string;
    email?: string;
    phone?: string;
  };
  updated_at: string;
}

export interface Listing {
  id: string; // UUID
  user_id: string; // Foreign key to Profile
  title: string;
  description: string | null;
  price: number;
  category: string;
  image_urls: string[];
  created_at: string;
}

/** * This type is for your main feed where you join the listing
 * with the seller's profile info.
 */
export type ListingWithProfile = Listing & {
  profiles: {
    display_name: string;
    avatar_url: string | null;
  };
};

/**
 * Helper for your form actions to ensure type safety
 * when creating a new item.
 */
export type CreateListingInput = Omit<Listing, "id" | "user_id" | "created_at">;
