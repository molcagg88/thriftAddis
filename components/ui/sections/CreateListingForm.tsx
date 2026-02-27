"use client";
import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X } from "lucide-react"; // npm install lucide-react

export default function CreateListingForm() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = useSupabase();

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Selection & Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !file) return alert("Please sign in and select an image!");

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Profile Upsert
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          username: user.id,
          display_name: user.fullName,
        },
        { onConflict: "id" },
      );

      if (profileError) throw profileError;

      // Image Upload
      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);

      // Insert Listing
      const { error: insertError } = await supabase.from("listings").insert({
        title: formData.get("title"),
        description: formData.get("description"),
        price: parseFloat(formData.get("price") as string),
        image_urls: [urlData.publicUrl],
        user_id: user.id,
      });

      if (insertError) throw insertError;

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto my-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 space-y-6 border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50"
      >
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            List an Item
          </h2>
          <p className="text-gray-500 text-sm">
            Fill in the details to reach thousands of buyers in Addis.
          </p>
        </div>

        {/* Custom Image Upload Area */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Product Photo
          </label>
          <div
            onClick={() => !previewUrl && fileInputRef.current?.click()}
            className={`relative group cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-all
              ${previewUrl ? "border-transparent" : "border-gray-300 hover:border-green-500 hover:bg-green-50/50 p-10"}`}
          >
            {previewUrl ? (
              <div className="relative aspect-video w-full">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-green-600">
                <ImagePlus className="w-12 h-12 mb-2" />
                <p className="text-sm font-medium">Click to upload photo</p>
                <p className="text-xs">PNG, JPG up to 1MB</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Item Name
            </label>
            <input
              name="title"
              required
              placeholder="e.g. Vintage Leather Jacket"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
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
              required
              placeholder="0.00"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Describe the condition, size, and any flaws..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/80 text-white py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Posting your item...
            </>
          ) : (
            "Post Listing"
          )}
        </button>
      </form>
    </div>
  );
}
