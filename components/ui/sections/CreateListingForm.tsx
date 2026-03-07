"use client";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X, Tag as TagIcon, Plus } from "lucide-react";
import { AlertDialog } from "@radix-ui/react-alert-dialog";

// The master list we created earlier
const THRIFT_TAGS = [
  "Graphic Tee",
  "Hoodie",
  "Sweatshirt",
  "Button-up",
  "Flannel",
  "Denim",
  "Cargo Pants",
  "Baggy Jeans",
  "Bomber Jacket",
  "Windbreaker",
  "Puffer Jacket",
  "Varsity Jacket",
  "Knitwear",
  "Tracksuit",
  "Workwear",
  "Sneakers",
  "Retro Runners",
  "Basketball Shoes",
  "Boots",
  "Loafers",
  "Slides",
  "70s Vintage",
  "80s Retro",
  "90s Grunge",
  "Y2K",
  "Early 2000s",
  "True Vintage",
  "Archive Piece",
  "Streetwear",
  "Gorpcore",
  "Minimalist",
  "Old Money",
  "Athleisure",
  "Band Merch",
  "Luxury",
  "Leather",
  "Suede",
  "Wool",
  "Linen",
  "Corduroy",
  "Oversized",
  "Boxy Fit",
  "Tote Bag",
  "Beanie",
  "Sunglasses",
  "Jewelry",
  "Cap",
  "Film Camera",
  "Vinyl Records",
  "Retro Gaming",
  "Action Figures",
  "Home Decor",
  "Limited Edition",
];

export default function CreateListingForm() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = useSupabase();

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tag States
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !file) return alert("Please sign in and select an image!");

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          { id: user.id, username: user.id, display_name: user.fullName },
          { onConflict: "id" },
        );
      if (profileError) throw profileError;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);

      // Insert Listing with Tags
      const { error: insertError } = await supabase.from("listings").insert({
        title: formData.get("title"),
        description: formData.get("description"),
        price: parseFloat(formData.get("price") as string),
        image_urls: [urlData.publicUrl],
        user_id: user.id,
        tags: selectedTags.join(","), // Save as comma-separated string for your .ilike search
      });

      if (insertError) throw insertError;
      alert("Listing created successfully!");
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
    <div className="max-w-xl mx-auto my-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 space-y-6 border border-gray-100 rounded-2xl shadow-xl"
      >
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            List an Item
          </h2>
          <p className="text-gray-500 text-sm">
            Help buyers find your item with the right tags.
          </p>
        </div>

        {/* Image Upload Area (Keep your existing code here) */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Product Photo
          </label>
          <div
            onClick={() => !previewUrl && fileInputRef.current?.click()}
            className={`relative group cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-all ${previewUrl ? "border-transparent" : "border-gray-300 hover:border-green-500 hover:bg-green-50/50 p-10"}`}
          >
            {previewUrl ? (
              <div className="relative aspect-video w-full">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow-md hover:text-red-600"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-green-600">
                <ImagePlus className="w-12 h-12 mb-2" />
                <p className="text-sm font-medium">Click to upload photo</p>
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

        <div className="space-y-4">
          {/* Item Name & Price (Keep your existing code here) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Item Name
              </label>
              <input
                name="title"
                required
                placeholder="e.g. 90s Nike Hoodie"
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
                required
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none"
              />
            </div>
          </div>

          {/* NEW: Tags Field */}
          <div className="space-y-2 relative">
            <label className="text-sm font-semibold text-gray-700 flex justify-between">
              Tags <span>{selectedTags.length}/5</span>
            </label>

            {/* Tag Pills Area */}
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

            <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all">
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
                placeholder="Add tags (Vintage, Streetwear...)"
                className="flex-1 bg-transparent outline-none text-sm font-medium"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {showSuggestions && tagInput && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addTag(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm font-medium transition-colors border-b border-gray-50 last:border-0"
                    >
                      {suggestion}
                    </button>
                  ))
                ) : (
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
              rows={3}
              placeholder="Tell us more about it..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] disabled:bg-gray-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Posting...
            </>
          ) : (
            "Post Listing"
          )}
        </button>
      </form>
    </div>
  );
}
