"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ImagePlus, Loader2, X, Trash2, ArrowLeft } from "lucide-react";

export default function EditListingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { id } = useParams();
  const supabase = useSupabase();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [listing, setListing] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchListing() {
      if (!isLoaded || !user) return;

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Listing not found");
        router.push("/");
        return;
      }

      if (data.user_id !== user.id) {
        alert("Unauthorized");
        router.push("/");
        return;
      }

      setListing(data);
      setLoading(false);
    }
    fetchListing();
  }, [id, user, isLoaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const removeNewImage = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function handleCloseListing() {
    const confirmClose = confirm(
      "Are you sure you want to close this listing? It will no longer appear in the marketplace.",
    );
    if (!confirmClose) return;

    setUpdating(true);
    const { error } = await supabase
      .from("listings")
      .update({ status: "closed" })
      .eq("id", id);

    if (error) {
      alert("Error closing listing");
    } else {
      alert("Listing closed!");
      router.push("/");
    }
    setUpdating(false);
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUpdating(true);
    const formData = new FormData(e.currentTarget);

    try {
      let currentImageUrls = listing.image_urls;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath);

        currentImageUrls = [urlData.publicUrl];
      }

      const { error: updateError } = await supabase
        .from("listings")
        .update({
          title: formData.get("title"),
          description: formData.get("description"),
          price: parseFloat(formData.get("price") as string),
          image_urls: currentImageUrls,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      alert("Listing updated successfully!");
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Update failed");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
        <p className="text-gray-500 font-medium">Fetching listing details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-10 px-4">
      {/* Top Navigation / Actions */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <button
          onClick={handleCloseListing}
          className="flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Close Listing
        </button>
      </div>

      <form
        onSubmit={handleUpdate}
        className="bg-white p-8 space-y-6 border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50"
      >
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Edit Details
          </h2>
          <p className="text-gray-500 text-sm">
            Update your item information or change the photo.
          </p>
        </div>

        {/* Image Section */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Product Photo
          </label>
          <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden bg-gray-50 transition-all hover:border-green-500">
            {/* Display Preview of NEW image if selected, otherwise display CURRENT image */}
            <div className="relative aspect-video w-full">
              <Image
                src={previewUrl || listing.image_urls[0]}
                alt="Listing Image"
                fill
                className="object-cover"
              />

              {/* Overlay for Change Image */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
              >
                <ImagePlus className="w-10 h-10 mb-2" />
                <span className="text-sm font-bold">Change Photo</span>
              </div>

              {/* Tag to indicate if it's a new unsaved preview */}
              {previewUrl && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-[10px] font-bold uppercase">
                  New Preview
                </div>
              )}

              {previewUrl && (
                <button
                  type="button"
                  onClick={removeNewImage}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Item Name
            </label>
            <input
              name="title"
              defaultValue={listing.title}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Price ($)
            </label>
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={listing.price}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={listing.description}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={updating}
          className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {updating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving Changes...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}
