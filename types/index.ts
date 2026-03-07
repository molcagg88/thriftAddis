export interface Profile {
  id: string; // Clerk User ID
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  contact_info: {
    instagram?: string;
    telegram?: string;
    phone?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string; // UUID
  user_id: string; // Foreign key to Profile
  title: string;
  description: string | null;
  price: number;
  location: string;
  tags: string[];
  status: "active" | "closed";
  image_urls: string[];
  created_at: string;
}

/** * This type is for your main feed where you join the listing
 * with the seller's profile info.
 */
export interface ContactInfo {
  instagram?: string;
  phone?: string;
  telegram?: string;
}
export type ListingWithProfile = Listing & {
  profiles: {
    display_name: string;
    avatar_url: string | null;
    contact_info: ContactInfo | null;
    created_at: string;
  };
};

/**
 * Helper for your form actions to ensure type safety
 * when creating a new item.
 */
export type CreateListingInput = Omit<Listing, "id" | "user_id" | "created_at">;
