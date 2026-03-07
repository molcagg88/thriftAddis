"use client";
import { useState, useEffect, useRef } from "react";
import { Search, ArrowLeft, X, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Using a subset of your tags for the mobile view
const POPULAR_TAGS = [
  "Graphic Tee",
  "Sneakers",
  "Y2K",
  "Streetwear",
  "Vintage",
  "Hoodie",
  "Denim",
  "Cargo Pants",
  "90s Grunge",
  "Leather",
  "Accessories",
];

export default function MobileSearchPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when the page loads for a native app feel
  useEffect(() => {
    // Small timeout ensures the transition finishes before focusing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    // Pushes to your exact same results page used by the desktop TopNav!
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const filteredTags = query
    ? POPULAR_TAGS.filter((t) => t.toLowerCase().includes(query.toLowerCase()))
    : POPULAR_TAGS;

  return (
    <div className="bg-white min-h-screen px-4 pt-6 pb-24 md:hidden">
      {/* Search Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1 flex items-center gap-2 border-2 border-green-600 px-4 py-3 bg-white focus-within:ring-2 ring-green-500/20 transition-all rounded-md">
          <Search size={20} className="text-green-600" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            placeholder="Search thrift items..."
            className="flex-1 bg-transparent outline-none text-base font-medium w-full"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Tags */}
      <div>
        <h3 className="text-xs uppercase font-black text-gray-400 tracking-widest mb-4">
          {query ? "Matching Tags" : "Popular Searches"}
        </h3>
        <div className="flex flex-wrap gap-2">
          {filteredTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleSearch(tag)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-100 rounded-full bg-gray-50 text-sm font-bold text-gray-700 hover:border-green-600 hover:text-green-600 transition-colors"
            >
              <Tag size={14} />
              {tag}
            </button>
          ))}
          {filteredTags.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              No tags match "{query}"
            </p>
          )}
        </div>
      </div>

      {/* Quick Search Button (Appears only when typing) */}
      {query.length > 0 && (
        <button
          onClick={() => handleSearch(query)}
          className="w-full mt-8 bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-100 flex items-center justify-center gap-2"
        >
          <Search size={20} />
          Search for "{query}"
        </button>
      )}
    </div>
  );
}
