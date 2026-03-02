"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  MessageCircle,
  User,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Flag,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BackButton from "@/components/buttons/BackButton";
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
  const [activeImage, setActiveImage] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [related, setRelated] = useState<ListingWithProfile[]>([]);

  useEffect(() => {
    async function fetchListingDetails() {
      // Fetch the specific listing and join the seller's profile
      const { data, error } = await supabase
        .from("listings")
        .select(`*, profiles (display_name, avatar_url, contact_info)`)
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error fetching listing:", error);
        alert("Listing not found or has been removed.");
        router.push("/");
        return;
      }

      setListing(data);

      // increment view count (best-effort)
      try {
        await supabase
          .from("listings")
          .update({ views: (data.views || 0) + 1 })
          .eq("id", id);
      } catch (e) {
        /* ignore */
      }

      // fetch related items by category
      try {
        const relatedQ = await supabase
          .from("listings")
          .select(`*, profiles(display_name, avatar_url)`)
          .eq("category", data.category)
          .neq("id", id)
          .limit(4);
        if (relatedQ.data) setRelated(relatedQ.data as ListingWithProfile[]);
      } catch (e) {
        /* ignore */
      }

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
  const sellerName = listing?.profiles?.display_name || "Thrift Addis Seller";
  const sellerAvatar = listing?.profiles?.avatar_url;
  const contactInfo = listing?.profiles?.contact_info || {};

  function formatDate(dateStr?: string | null) {
    if (!dateStr) return "Unknown";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  async function toggleFavorite() {
    if (!user) return router.push("/sign-in");
    setFavorited((v) => !v);
    try {
      if (!favorited) {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, listing_id: id });
      } else {
        await supabase
          .from("favorites")
          .delete()
          .match({ user_id: user.id, listing_id: id });
      }
    } catch (e) {
      // ignore errors, keep optimistic UI
    }
  }

  function handleShare() {
    const shareData = {
      title: listing?.title || "Listing",
      text: listing?.description || "Check out this item",
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else if (typeof navigator !== "undefined") {
      void navigator.clipboard?.writeText(shareData.url || "");
      alert("Listing URL copied to clipboard");
    }
  }

  function handleBuyNow() {
    if (!user) return router.push("/sign-in");
    router.push(`/checkout?listing=${id}`);
  }

  return (
    <div className="max-w-6xl mx-auto my-10 px-4">
      <div className="flex items-center justify-between mb-4">
        <BackButton label="Back to Marketplace" />
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={toggleFavorite}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Heart
              className={`w-5 h-5 ${favorited ? "text-red-500" : "text-gray-600"}`}
            />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image Gallery */}
          <div className="relative bg-gray-50 flex flex-col items-stretch">
            {isClosed && (
              <div className="absolute top-4 left-4 z-10 bg-black/80 text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider backdrop-blur-sm">
                {listing?.status}
              </div>
            )}

            <div className="relative w-full h-[60vh] md:h-[70vh]">
              <Image
                src={listing?.image_urls?.[activeImage] || "./placeholder.svg"}
                alt={listing?.title || ""}
                fill
                className={`object-cover ${isClosed ? "grayscale opacity-80" : ""}`}
                priority
              />
              {/* Prev/Next */}
              {listing?.image_urls && listing.image_urls.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((i) => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImage((i) =>
                        Math.min((listing.image_urls?.length || 1) - 1, i + 1),
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {listing?.image_urls && listing.image_urls.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {listing.image_urls.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border ${idx === activeImage ? "border-primary" : "border-gray-100"}`}
                  >
                    <Image
                      src={src}
                      alt={`thumb-${idx}`}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="p-6 md:p-10 flex flex-col h-full">
            <div className="grow space-y-4">
              {/* Title & Price */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1
                    className={`text-2xl md:text-3xl font-extrabold text-gray-900 ${isClosed ? "line-through text-gray-500" : ""}`}
                  >
                    {listing?.title}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{listing?.location || "Unknown"}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl md:text-3xl font-black text-primary">
                    {listing?.price != null
                      ? `${listing.price.toFixed(2)} ETB`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">
                    {listing?.category || "Misc"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Posted</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(listing?.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium text-gray-900">
                    {listing?.status || "active"}
                  </p>
                </div>
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
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Sold by</p>
                  <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                    {sellerName}
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">·</span>
                      <Star className="w-4 h-4 text-yellow-600" />
                      <span>4.8</span>
                    </div>
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since {formatDate(listing?.profiles?.created_at)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => router.push(`/userpage/${listing?.user_id}`)}
                    className="py-2 px-3 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Call to Action Section */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3">
              {isOwner ? (
                <Link
                  href={`/listing/edit/${listing?.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl font-bold text-lg transition-all"
                >
                  Edit Your Listing
                </Link>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    disabled={isClosed}
                    onClick={handleBuyNow}
                    className="col-span-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" /> Buy Now
                  </button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        disabled={isClosed}
                        className="w-full bg-white border border-gray-200 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                      >
                        <MessageCircle className="w-5 h-5 inline-block mr-2" />{" "}
                        Contact
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
                              rel="noreferrer"
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
                              href={`https://t.me/${contactInfo.telegram}`}
                              target="_blank"
                              rel="noreferrer"
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
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-500 flex items-center gap-3">
                  {!isOwner && (
                    <button className="flex items-center gap-2 text-gray-600 hover:text-black">
                      <Flag className="w-4 h-4" /> Report
                    </button>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Listed on {formatDate(listing?.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related items */}
      {related.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">More in this category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/listing/${r.id}`}
                className="bg-white rounded-lg p-3 border border-gray-100 hover:shadow"
              >
                <div className="w-full h-40 relative mb-2">
                  <Image
                    src={r.image_urls?.[0] || "./placeholder.svg"}
                    alt={r.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {r.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${r.price?.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
