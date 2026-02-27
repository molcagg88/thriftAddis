import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ClerkProvider, useUser } from "@clerk/nextjs";
import { TopNav } from "@/components/marketplace/top-nav";
import { BottomNav } from "@/components/marketplace/bottom-nav";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Thrift Addis",
  description: "Find Your Next Vibe - thrifted fashion and vintage items",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans antialiased">
          <TopNav />

          {/*
            the nav is fixed to the bottom of the viewport; without extra
            padding our content gets tucked underneath it and on narrow
            devices the page will shrink when the nav is removed (md:hidden),
            causing the scroll position to jump back to the top.  give the
            scrollable area a bottom padding that matches the height of the
            bar so nothing can be covered and the layout height never changes
            unexpectedly.
          */}
          <div className="min-h-screen pb-20 md:pb-0">{children}</div>

          <BottomNav />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
