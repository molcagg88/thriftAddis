"use client";
import { Search, Plus, User, Settings } from "lucide-react";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
export function TopNav() {
  const user = useUser();
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
            <div className="flex items-center gap-2">
              <UserButton afterSignOutUrl="/" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-slate-100">
                    <Settings size={18} className="text-green-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user?.user?.id}`}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/">About Us</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/">FAQs</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/">Contact Us</Link>
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
