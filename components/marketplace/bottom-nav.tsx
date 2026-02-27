"use client";
import { Profile } from "@/types";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Home, Search, Plus, User, LogIn } from "lucide-react";
import Link from "next/link";

// interface BottomNavProps {
//   user: Profile | undefined;
// }

export function BottomNav() {
  const user = useUser().user;
  return (
    // set an explicit height so we can sync the padding on the parent
    // container. env(safe-area-inset-bottom) is included for iOS notch
    <nav className="fixed inset-x-0 bottom-0 h-20 md:hidden bg-white border-t-2 border-primary z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-full pt-4">
        {/* Home */}
        <button className="flex flex-col items-center gap-1 p-3 hover:bg-green-50 transition-colors">
          <Home size={24} className="text-primary" />
          <span className="text-xs text-primary font-bold">Home</span>
        </button>

        {/* Search */}
        <button className="flex flex-col items-center gap-1 p-3 hover:bg-green-50 transition-colors">
          <Search size={24} className="text-primary" />
          <span className="text-xs text-primary font-bold">Search</span>
        </button>

        {/* Sell - Center Prominent Button */}
        <Link
          href={"/listing/create"}
          className="flex flex-col items-center gap-1 bg-primary text-white p-4 -mt-6 border-2 border-primary hover:bg-primary transition-colors"
        >
          <Plus size={28} />
          <span className="text-xs font-bold">Sell</span>
        </Link>

        {/* Profile */}

        <Link
          href={`/userpage/${user?.id}`}
          className="flex flex-col items-center gap-1 p-3 hover:bg-green-50 transition-colors"
        >
          <User size={24} className="text-primary" />
          <span className="text-xs text-primary font-bold">Profile</span>
        </Link>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="flex flex-col items-center gap-1 p-3 hover:bg-green-50 transition-colors">
              <LogIn size={24} className="text-primary" />
              <span className="text-xs text-primary font-bold">Sign In</span>
            </button>
          </SignInButton>
        </SignedOut>

        {/* If the user IS logged in, show their avatar */}
        <SignedIn>
          <div className="p-3">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    </nav>
  );
}
