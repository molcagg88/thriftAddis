"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. Define a schema for validation
const ListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  description: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
});

export async function createListing(formData: FormData) {
  // 2. Check Authentication
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 3. Validate the Form Data
  const validatedFields = ListingSchema.safeParse({
    title: formData.get("title"),
    price: formData.get("price"),
    description: formData.get("description"),
    category: formData.get("category"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  // 4. Initialize our Secure Client
  const supabase = await createSupabaseServerClient();

  // 5. Insert into Database
  const { error } = await supabase
    .from("listings")
    .insert(validatedFields.data);

  if (error) {
    console.error(error);
    return { error: "Failed to save listing to database." };
  }

  // 6. Refresh the UI
  revalidatePath("/"); // Clears the cache so the new item appears instantly
  return { success: true };
}

export async function updateListing(id: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // We reuse the same Zod validation schema from createListing
  const validatedFields = ListingSchema.safeParse({
    title: formData.get("title"),
    price: formData.get("price"),
    description: formData.get("description"),
    category: formData.get("category"),
  });

  if (!validatedFields.success) return { error: "Invalid data" };

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("listings")
    .update(validatedFields.data)
    .eq("id", id); // 🎯 This ensures we only update this specific item

  if (error) return { error: "Update failed" };

  revalidatePath("/");
  return { success: true };
}

export async function deleteListing(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();

  // Supabase checks your RLS policy automatically here
  const { error } = await supabase.from("listings").delete().eq("id", id);

  if (error) return { error: "Could not delete listing" };

  revalidatePath("/");
  return { success: true };
}
