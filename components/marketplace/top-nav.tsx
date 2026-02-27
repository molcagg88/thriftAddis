import { Search, Plus, User } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
export function TopNav() {
  return (
    <nav className="hidden md:flex sticky top-0 z-40 w-full bg-white border-b-2 border-green-600">
      <div className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href={"/"}>
          <div className="text-2xl font-bold text-green-600 tracking-tight">
            THRIFT ADDIS
          </div>
        </Link>

        {/* Search Bar - Center */}
        <div className="flex-1 flex items-center gap-2 border-2 border-green-600 px-4 py-2">
          <Search size={20} className="text-green-600" />
          <input
            type="text"
            placeholder="Search items..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/listing/create"
            className="bg-green-600 text-white px-6 py-2 border-2 border-green-600 font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Sell Item
          </Link>
          {/* <User size={24} className="text-green-600" /> */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-black text-white px-4 py-2 rounded-full">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          {/* If the user IS logged in, show their avatar */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
