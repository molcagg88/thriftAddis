"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, MessageCircle, User } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Listing, ListingWithProfile } from "@/types";

export default function ViewListingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { id } = useParams();
  const supabase = useSupabase();

  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<ListingWithProfile | null>(null);

  useEffect(() => {
    async function fetchListingDetails() {
      // We fetch the specific listing and join the seller's profile
      const { data, error } = await supabase
        .from("listings")
        .select(
          `
          *,
          profiles (display_name, avatar_url, contact_info)
        `,
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error fetching listing:", error);
        alert("Listing not found or has been removed.");
        router.push("/");
        return;
      }

      setListing(data);
      setLoading(false);
    }

    fetchListingDetails();
  }, [id, router, supabase]);

  if (loading || !isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
        <p className="text-gray-500 font-medium">Loading item details...</p>
      </div>
    );
  }

  const isOwner = user?.id === listing?.user_id;
  const isClosed = listing?.status === "closed";

  // Supabase returns relations as objects or arrays depending on the schema.
  // We use optional chaining to safely access the joined profile.
  const sellerName = listing?.profiles?.display_name || "Thrift Addis Seller";
  const sellerAvatar = listing?.profiles?.avatar_url;
  const contactInfo = listing?.profiles?.contact_info || {};

  return (
    <div className="max-w-5xl mx-auto my-10 px-4">
      {/* Top Navigation */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-500 hover:text-black transition-colors mb-6 w-fit"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        <span className="text-sm font-medium">Back to Marketplace</span>
      </button>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image Gallery */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-gray-50">
            {isClosed && (
              <div className="absolute top-4 left-4 z-10 bg-black/80 text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider backdrop-blur-sm">
                {listing.status}
              </div>
            )}
            <Image
              src={listing?.image_urls[0] || "./placeholder.svg"}
              alt={listing?.title || ""}
              fill
              className={`object-cover ${isClosed ? "grayscale opacity-80" : ""}`}
              priority
            />
          </div>

          {/* Right Column: Details & Actions */}
          <div className="p-8 md:p-10 flex flex-col h-full">
            <div className="grow space-y-6">
              {/* Title & Price */}
              <div className="space-y-2">
                <h1
                  className={`text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight ${isClosed ? "line-through text-gray-500" : ""}`}
                >
                  {listing?.title}
                </h1>
                <p className="text-3xl font-black text-primary">
                  ${listing?.price.toFixed(2)}
                </p>
              </div>

              {/* Description */}
              <div className="prose prose-gray">
                <p className="text-muted-foreground">Description</p>
                <p className="p-2 text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {listing?.description ||
                    "No description provided by the seller."}
                </p>
              </div>

              <hr className="border-gray-100" />

              {/* Seller Info Box */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden relative border border-gray-200">
                  {sellerAvatar ? (
                    <Image
                      src={sellerAvatar}
                      alt={sellerName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Sold by</p>
                  <p className="text-base font-bold text-gray-900 flex items-center gap-1">
                    {sellerName}
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action Section */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              {isOwner ? (
                <Link
                  href={`/listing/edit/${listing?.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 py-4 rounded-xl font-bold text-lg transition-all"
                >
                  Edit Your Listing
                </Link>
              ) : (
                // wrap the call‑to‑action in a dialog so we can show contact details
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      disabled={isClosed}
                      className="w-full bg-primary hover:bg-primary/70 text-white py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isClosed ? (
                        "Item Unavailable"
                      ) : (
                        <>
                          <MessageCircle className="w-5 h-5" />
                          Contact Seller
                        </>
                      )}
                    </button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contact {sellerName}</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      The seller shared the following info:
                    </DialogDescription>
                    <div className="space-y-2">
                      {contactInfo.phone && (
                        <p>
                          Phone:{" "}
                          <a
                            href={`tel:${contactInfo.phone}`}
                            className="text-green-600 underline"
                          >
                            {contactInfo.phone}
                          </a>
                        </p>
                      )}

                      {contactInfo.instagram && (
                        <p>
                          Instagram:{" "}
                          <a
                            href={`https://instagram.com/${contactInfo.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 underline"
                          >
                            @{contactInfo.instagram}
                          </a>
                        </p>
                      )}
                      {contactInfo.telegram && (
                        <p>
                          Telegram:{" "}
                          <a
                            href={`https://instagram.com/${contactInfo.telegram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 underline"
                          >
                            @{contactInfo.telegram}
                          </a>
                        </p>
                      )}
                      {!contactInfo.phone &&
                        !contactInfo.telegram &&
                        !contactInfo.instagram && (
                          <p className="text-gray-500">
                            Seller hasn’t provided contact details.
                          </p>
                        )}
                    </div>
                    <DialogFooter>
                      <DialogClose className="bg-primary text-white px-4 py-2 rounded">
                        Close
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
