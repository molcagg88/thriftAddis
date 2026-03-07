"use client";
import { usePathname } from "next/navigation"; // 1. Import usePathname
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Home, Search, Plus, User, LogIn, Settings } from "lucide-react";
import Link from "next/link";

export function BottomNav() {
  const { user } = useUser();
  const pathname = usePathname(); // 2. Initialize pathname

  // Helper function to check if a link is active
  const isActive = (path: string) => pathname === path;

  // Active Style logic
  const activeClass = "bg-green-50 text-green-700";
  const inactiveClass = "text-gray-500";

  return (
    <nav className="fixed inset-x-0 bottom-0 h-20 md:hidden  bg-white overflow-hidden border-t-2 border-green-600 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-full pt-2">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 p-3 transition-all ${
            isActive("/") ? activeClass : inactiveClass
          }`}
        >
          <Home size={24} strokeWidth={isActive("/") ? 3 : 2} />
          <span className="text-[10px] font-bold uppercase">Home</span>
        </Link>

        {/* Search */}
        <Link
          href="/mobile-search"
          className={`flex flex-col items-center gap-1 p-3 transition-all ${
            isActive("/mobile-search") ? activeClass : inactiveClass
          }`}
        >
          <Search size={24} strokeWidth={isActive("/mobile-search") ? 3 : 2} />
          <span className="text-[10px] font-bold uppercase">Search</span>
        </Link>

        {/* Sell - Center Prominent Button (Special Styling) */}
        <Link
          href="/listing/create"
          className={`flex flex-col items-center gap-1 p-4 -mt-10 border-2 border-green-600 transition-all shadow-[4px_4px_0px_0px_rgba(22,163,74,1)] ${
            isActive("/listing/create")
              ? "bg-yellow-400 text-green-900 scale-110"
              : "bg-green-600 text-white"
          }`}
        >
          <Plus size={28} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase">Sell</span>
        </Link>

        {/* Profile */}
        <SignedIn>
          <Link
            href={`/profile/${user?.id}`}
            className={`flex flex-col items-center gap-1 p-3 transition-all ${
              isActive(`/profile/${user?.id}`) ? activeClass : inactiveClass
            }`}
          >
            <User
              size={24}
              strokeWidth={isActive(`/profile/${user?.id}`) ? 3 : 2}
            />
            <span className="text-[10px] font-bold uppercase">Profile</span>
          </Link>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button
              className={`flex flex-col items-center gap-1 p-3 ${inactiveClass}`}
            >
              <LogIn size={24} />
              <span className="text-[10px] font-bold uppercase">Sign In</span>
            </button>
          </SignInButton>
        </SignedOut>

        {/* More/Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex flex-col items-center gap-1 p-3 transition-all ${
                isActive("/about") || isActive("/settings")
                  ? activeClass
                  : inactiveClass
              }`}
            >
              <Settings size={24} />
              <span className="text-[10px] font-bold uppercase">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top" // Ensure it opens upwards on mobile
            className="bg-white border-2 border-green-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] p-2 min-w-[160px] z-[60] mb-4"
          >
            <DropdownMenuItem className="outline-none mb-1">
              <div className="flex w-full items-center justify-between px-3 py-2 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-100 rounded-md">
                <span>Account</span>
                <UserButton afterSignOutUrl="/" />
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/about"
                className={`flex w-full px-3 py-2 text-sm font-bold rounded-md mb-1 ${
                  isActive("/about")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-700 hover:bg-green-50"
                }`}
              >
                About Us
              </Link>
            </DropdownMenuItem>

            <SignedIn>
              <SignOutButton>
                <button className="flex w-full px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-md border-t border-gray-100 mt-1 pt-2">
                  Sign out
                </button>
              </SignOutButton>
            </SignedIn>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
