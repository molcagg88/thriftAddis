"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Plus, Settings, Tag, Shirt, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useUser,
  UserButton,
  SignInButton,
  SignedIn,
  SignedOut,
  SignOutButton,
} from "@clerk/nextjs";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Adjust path to your UI folder

const THRIFT_TAGS = [
  "T-shirt",
  "Shirt",
  "Dress Shirt",
  "Jacket",
  "Shoes",
  "Trousers",
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
  "Silk Scarf",
  "Leather Belt",
  "Crossbody Bag",
  "Bucket Hat",
  "Wristwatch",
  "Limited Edition",
  "Cardigan",
  "Blazer",
  "Denim Vest",
  "Track Jacket",
  "Heels",
];

export function TopNav({ recentListings = [] }: { recentListings?: any[] }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleEvents = (e: any) => {
      if (
        e.key === "Escape" ||
        (dropdownRef.current && !dropdownRef.current.contains(e.target))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleEvents);
    document.addEventListener("keydown", handleEvents);
    return () => {
      document.removeEventListener("mousedown", handleEvents);
      document.removeEventListener("keydown", handleEvents);
    };
  }, []);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  // Filter tags based on query
  const filteredTags = THRIFT_TAGS.filter((tag) =>
    tag.toLowerCase().includes(query.toLowerCase()),
  ).slice(0, 6);

  // Filter listings only if there is an active query to keep dropdown size manageable
  const filteredListings =
    query.length > 1
      ? recentListings
          .filter((l) => l.title.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 4)
      : [];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b-2 border-green-600">
      <div
        className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6"
        ref={dropdownRef}
      >
        <Link href="/">
          <div className="text-2xl font-black text-green-600 tracking-tighter">
            THRIFT ADDIS
          </div>
        </Link>

        {/* Search Container */}
        <div className="relative flex-1 max-w-xl">
          <div className="flex items-center gap-2 border-2 border-green-600 px-4 py-2 bg-white focus-within:ring-2 ring-green-500/20 transition-all">
            <Search size={20} className="text-green-600" />
            <input
              type="text"
              value={query}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              placeholder="Search vintage, sneakers, tags..."
              className="flex-1 bg-transparent outline-none text-sm font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Hanging Autocomplete Modal */}
          {isOpen && (query.length > 0 || filteredTags.length > 0) && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border-2 border-green-600 shadow-2xl z-50 overflow-hidden rounded-sm">
              <div className="p-2 border-b border-gray-100 bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                Popular Tags
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {filteredTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleSearch(tag)}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <Tag size={16} className="text-green-600" />
                    <span className="text-sm font-bold text-gray-800">
                      {tag}
                    </span>
                  </button>
                ))}

                {filteredListings.length > 0 && (
                  <>
                    <div className="p-2 border-b border-gray-100 bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                      Matching Items
                    </div>
                    {filteredListings.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSearch(item.title)}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <Shirt size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-gray-600 truncate">
                          {item.title}
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <Link
              href="/listing/create"
              className="bg-green-600 text-white px-6 py-2 border-2 border-green-600 font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Sell Item
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-green-600 text-white px-6 py-2 border-2 border-green-600 font-bold hover:bg-green-700 transition-colors flex items-center gap-2">
                <Plus size={20} />
                Sell Item
              </button>
            </SignInButton>
          </SignedOut>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-2">
              <UserButton afterSignOutUrl="/" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <Settings size={18} className="text-green-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white border-2 border-gray-100 shadow-xl p-2 min-w-[160px] z-[60]"
                >
                  <DropdownMenuItem className="outline-none">
                    <Link
                      href={`/profile/${user?.id}`}
                      className="flex w-full px-2 py-2 text-sm font-bold text-gray-700 hover:bg-green-50 rounded-md"
                    >
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="outline-none">
                    <Link
                      href="/about"
                      className="flex w-full px-2 py-2 text-sm font-bold text-gray-700 hover:bg-green-50 rounded-md"
                    >
                      About Us
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="outline-none border-t border-gray-100 mt-1 pt-1">
                    <SignOutButton>
                      <button className="flex w-full px-2 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-md">
                        Sign out
                      </button>
                    </SignOutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
