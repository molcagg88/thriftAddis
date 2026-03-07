"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  ImagePlus,
  Loader2,
  X,
  Trash2,
  Tag as TagIcon,
  Plus,
} from "lucide-react";
import BackButton from "@/components/buttons/BackButton";

// Consistency with the Create page
const THRIFT_TAGS = [
  "Graphic Tee",
  "Hoodie",
  "Sweatshirt",
  "Denim",
  "Cargo Pants",
  "Baggy Jeans",
  "Bomber Jacket",
  "Puffer Jacket",
  "Knitwear",
  "Sneakers",
  "Retro Runners",
  "70s Vintage",
  "80s Retro",
  "90s Grunge",
  "Y2K",
  "Streetwear",
  "Gorpcore",
  "Luxury",
  "Leather",
  "Oversized",
  "Tote Bag",
  "Accessories",
];

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

  // Tag States
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      // Initialize tags from existing data
      if (data.tags) {
        setSelectedTags(data.tags.split(",").filter((t: string) => t !== ""));
      }
      setLoading(false);
    }
    fetchListing();
  }, [id, user, isLoaded]);

  // Tag Logic
  const addTag = (tag: string) => {
    const cleanTag = tag.trim();
    if (
      cleanTag &&
      !selectedTags.includes(cleanTag) &&
      selectedTags.length < 5
    ) {
      setSelectedTags([...selectedTags, cleanTag]);
    }
    setTagInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const filteredSuggestions = THRIFT_TAGS.filter(
    (t) =>
      t.toLowerCase().includes(tagInput.toLowerCase()) &&
      !selectedTags.includes(t),
  ).slice(0, 5);

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
          tags: selectedTags.join(","), // Updating tags field
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

  // (Keeping handleCloseListing the same as your code)
  async function handleCloseListing() {
    const confirmClose = confirm(
      "Are you sure you want to close this listing?",
    );
    if (!confirmClose) return;
    setUpdating(true);
    const { error } = await supabase
      .from("listings")
      .update({ status: "closed" })
      .eq("id", id);
    if (!error) {
      alert("Listing closed!");
      router.push("/");
    }
    setUpdating(false);
  }

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
        <p className="text-gray-500 font-medium">Fetching listing details...</p>
      </div>
    );

  return (
    <div className="max-w-xl mx-auto my-10 px-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <BackButton label="Back" />
        <button
          onClick={handleCloseListing}
          className="flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Close Listing
        </button>
      </div>

      <form
        onSubmit={handleUpdate}
        className="bg-white p-8 space-y-6 border border-gray-100 rounded-2xl shadow-xl"
      >
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Edit Details
          </h2>
          <p className="text-gray-500 text-sm">
            Update your tags so more people in Addis see your item.
          </p>
        </div>

        {/* Image Section */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Product Photo
          </label>
          <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden bg-gray-50 transition-all hover:border-green-500">
            <div className="relative aspect-video w-full">
              <Image
                src={previewUrl || listing.image_urls[0]}
                alt="Listing Image"
                fill
                className="object-cover"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
              >
                <ImagePlus className="w-10 h-10 mb-2" />
                <span className="text-sm font-bold">Change Photo</span>
              </div>
              {previewUrl && (
                <button
                  type="button"
                  onClick={removeNewImage}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-red-600"
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

        {/* Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Item Name
              </label>
              <input
                name="title"
                defaultValue={listing.title}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Price (ETB)
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={listing.price}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none"
              />
            </div>
          </div>

          {/* EDIT TAGS FIELD */}
          <div className="space-y-2 relative">
            <label className="text-sm font-semibold text-gray-700 flex justify-between">
              Tags <span>{selectedTags.length}/5</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
              <TagIcon size={18} className="text-gray-400" />
              <input
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="Edit tags..."
                className="flex-1 bg-transparent outline-none text-sm font-medium"
              />
            </div>
            {showSuggestions && tagInput && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addTag(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm font-medium border-b border-gray-50 last:border-0"
                  >
                    {suggestion}
                  </button>
                ))}
                {!THRIFT_TAGS.includes(tagInput) && (
                  <button
                    type="button"
                    onClick={() => addTag(tagInput)}
                    className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm font-bold text-green-600"
                  >
                    <Plus size={14} className="inline mr-1" /> Add "{tagInput}"
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={listing.description}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={updating}
          className="w-full bg-primary hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:bg-gray-300 flex items-center justify-center gap-2"
        >
          {updating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}
