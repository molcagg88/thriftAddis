"use client";
import { useState, useRef } from "react";
import Cropper from "react-easy-crop";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, Loader2 } from "lucide-react";
import BackButton from "@/components/buttons/BackButton";
import { Profile, Listing } from "@/types";
import ProductCard from "@/components/marketplace/product-card";
import { useSupabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";

// helper to load image
async function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = document.createElement("img");
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // needed to avoid CORS issues
    image.src = url;
  });
}

// given a source image and cropping info, returns a blob of the cropped area
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob!);
      },
      "image/jpeg",
      1,
    );
  });
}

// simple compression: reduce quality until under 1MB
async function compressImage(blob: Blob): Promise<Blob> {
  let quality = 0.9;
  let current = blob;
  while (current.size > 1048576 && quality > 0.1) {
    current = await new Promise<Blob>((resolve) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context not available");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (b) => {
            resolve(b!);
          },
          "image/jpeg",
          quality,
        );
      };
      img.src = URL.createObjectURL(current);
    });
    quality -= 0.1;
  }
  return current;
}

interface EditProfileProps {
  seller: Profile;
  listings?: Listing[];
}

export default function EditProfile({
  seller,
  listings = [],
}: EditProfileProps) {
  const { user } = useUser();
  const supabase = useSupabase();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [phone, setPhone] = useState<string>(seller.contact_info?.phone || "");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const DISPLAY_NAME_MAX = 50;
  const BIO_MAX = 400;
  const CONTACT_MAX = 30;
  const [displayName, setDisplayName] = useState<string>(
    seller.display_name || "",
  );
  const [bioText, setBioText] = useState<string>(seller.bio || "");
  const [instagram, setInstagram] = useState<string>(
    seller.contact_info?.instagram || "",
  );
  const [telegram, setTelegram] = useState<string>(
    seller.contact_info?.telegram || "",
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    seller.avatar_url,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setAvatarError(null);
      // open cropper for any selected image
      const url = URL.createObjectURL(selectedFile);
      setSourceUrl(url);
      setShowCropper(true);
      // we'll store the final file after cropping
    }
  };

  function validatePhone(value: string) {
    const cleaned = value.replace(/\s|-/g, "");
    const ok = /^\+?\d{10,13}$/.test(cleaned);
    setPhoneError(
      ok
        ? null
        : "Enter a valid phone number (include country code, 10–13 digits)",
    );
    return ok;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // ensure avatar size still within bounds
    if (file && file.size > 1048576) {
      alert("Avatar file is too large after crop/compression.");
      return;
    }
    e.preventDefault();
    if (!user) return alert("Please sign in to save changes");

    // Validate phone before starting save
    if (phone && !validatePhone(phone)) {
      return alert("Please enter a valid phone number including country code.");
    }

    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    try {
      let finalAvatarUrl = seller.avatar_url;

      // 1. Upload new avatar if a file was selected
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}-avatar.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upsert the file (replaces old one if names match)
        const { error: uploadError } = await supabase.storage
          .from("listing-images") // You can use a separate 'avatars' bucket if you prefer
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath);

        finalAvatarUrl = urlData.publicUrl;
      }

      // 2. Update Profile in Supabase
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: formData.get("display_name"),
          bio: formData.get("bio"),
          avatar_url: finalAvatarUrl,
          contact_info: {
            instagram: formData.get("contact_instagram"),
            telegram: formData.get("contact_telegram"),
            phone: formData.get("contact_phone"),
          },
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      alert("Profile updated successfully!");
      router.refresh(); // Refresh data on the page
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <BackButton variant="floating" />

      <section className="pt-20 md:pt-8 px-4 md:px-6 py-8 md:py-12 bg-white border-b-2 border-green-600">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Edit Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profile Photo
              </label>
              <div className="mt-2 flex items-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-green-600 bg-gray-100 shadow-inner">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                      <ImagePlus size={32} />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                  >
                    <ImagePlus className="w-5 h-5 mr-2" />
                    Change Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {avatarError && (
                    <p className="text-sm text-red-600 mt-2">{avatarError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Cropper Modal */}
            {showCropper && sourceUrl && (
              <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex flex-col items-center justify-center">
                <div className="relative w-80 h-80 bg-white p-4 rounded">
                  <Cropper
                    image={sourceUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, areaPixels) =>
                      setCroppedAreaPixels(areaPixels)
                    }
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3/4">
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCropper(false);
                      setSourceUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="px-4 py-2 bg-gray-200 rounded z-10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      // generate cropped blob
                      if (!croppedAreaPixels || !sourceUrl) return;
                      const croppedBlob = await getCroppedImg(
                        sourceUrl,
                        croppedAreaPixels,
                      );
                      const compressed = await compressImage(croppedBlob);
                      if (compressed.size > 1048576) {
                        setAvatarError(
                          "Unable to reduce image below 1MB, please crop more or pick a smaller file.",
                        );
                        return;
                      }
                      const finalFile = new File([compressed], "avatar.jpg", {
                        type: "image/jpeg",
                      });
                      setFile(finalFile);
                      setPreviewUrl(URL.createObjectURL(finalFile));
                      setShowCropper(false);
                      setSourceUrl(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded z-10"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* Display Name */}
            <div>
              <label
                htmlFor="display_name"
                className="block text-sm font-medium text-gray-700"
              >
                Display Name
              </label>
              <input
                id="display_name"
                name="display_name"
                value={displayName}
                onChange={(e) =>
                  setDisplayName(e.target.value.slice(0, DISPLAY_NAME_MAX))
                }
                required
                maxLength={DISPLAY_NAME_MAX}
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm outline-none ${displayName.length >= DISPLAY_NAME_MAX ? "border-yellow-500" : "border-gray-300"}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                {displayName.length}/{DISPLAY_NAME_MAX}
              </p>
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={bioText}
                onChange={(e) => setBioText(e.target.value.slice(0, BIO_MAX))}
                rows={4}
                maxLength={BIO_MAX}
                className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {bioText.length}/{BIO_MAX}
              </p>
            </div>

            {/* Contact Info */}
            <fieldset className="space-y-4 pt-4">
              <legend className="text-lg font-bold text-gray-900">
                Contact Info
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact_instagram"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Instagram
                  </label>
                  <input
                    id="contact_instagram"
                    name="contact_instagram"
                    value={instagram}
                    onChange={(e) =>
                      setInstagram(e.target.value.slice(0, CONTACT_MAX))
                    }
                    maxLength={CONTACT_MAX}
                    placeholder="@username"
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {instagram.length}/{CONTACT_MAX}
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="contact_telegram"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Telegram
                  </label>
                  <input
                    id="contact_telegram"
                    name="contact_telegram"
                    value={telegram}
                    onChange={(e) =>
                      setTelegram(e.target.value.slice(0, CONTACT_MAX))
                    }
                    maxLength={CONTACT_MAX}
                    placeholder="@username"
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {telegram.length}/{CONTACT_MAX}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="contact_phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone
                  </label>
                  <input
                    id="contact_phone"
                    name="contact_phone"
                    maxLength={13}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      validatePhone(e.target.value);
                    }}
                    placeholder="+251..."
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm outline-none ${phoneError ? "border-red-600" : "border-gray-300"}`}
                  />
                  {phoneError && (
                    <p className="text-sm text-red-600 mt-1">{phoneError}</p>
                  )}
                </div>
              </div>
            </fieldset>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSaving || !!phoneError || !!avatarError}
                className="w-full md:w-auto inline-flex justify-center py-3 px-10 border border-transparent shadow-lg text-sm font-bold rounded-full text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-all active:scale-95 disabled:bg-gray-400 items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Existing Listings */}
      {listings.length > 0 && (
        <section className="px-4 md:px-6 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-8 border-b-2 border-green-600 pb-4">
              Your Active Listings
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {listings.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product} // Changed from 'product' to 'listing' to match your updated ProductCard prop
                  sellerName={seller.display_name || ""}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
