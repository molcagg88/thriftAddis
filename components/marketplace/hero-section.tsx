// export function HeroSection() {
//   return (
//     <section className="relative bg-green-600 text-white py-20 md:py-32 px-4 overflow-hidden">
//       {/* Background Statue - Left (Classic Lagare Lion) */}
//       <div className="absolute -left-10 bottom-0 w-64 md:w-80 opacity-20 pointer-events-none hidden sm:block">
//         <img
//           src="./images/lionStatue.png"
//           alt="Classic Lion Statue"
//           className="object-contain w-full h-auto"
//         />
//       </div>

//       {/* Background Statue - Right (Modern Red Lion) */}
//       <div className="absolute -right-10 bottom-0 w-72 md:w-96 opacity-20 pointer-events-none hidden sm:block">
//         <span className="flex flex-col justify-end">
//           <img
//             src="./images/biggerLion.png"
//             alt="Modern Lion Statue"
//             className="bottom-0 object-contain w-full h-auto transform scale-x-[-1]"
//           />
//         </span>
//       </div>

//       {/* Main Content */}
//       <div className="relative z-10 max-w-7xl mx-auto text-center">
//         <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
//           Find Your Next Vibe
//         </h1>
//         <p className="text-lg md:text-2xl mb-10 max-w-2xl mx-auto opacity-95 font-medium">
//           Discover unique, curated vintage and thrifted items from independent
//           sellers right in the heart of Addis.
//         </p>

//         {/* Optional: Add a CTA button to pull the look together */}
//         <button className="bg-white text-green-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg">
//           Start Shopping
//         </button>
//       </div>
//     </section>
//   );
// }
"use client";
export function HeroSection() {
  return (
    <section
      className="relative h-[70vh] flex flex-col justify-center items-center bg-center bg-cover text-[#f8f1e5] px-4 overflow-hidden"
      style={{ backgroundImage: `url('./images/hero.avif')` }} //
    >
      {/* Modern Multi-layered Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/50 z-0"></div>
      <div className="absolute inset-0 bg-green-900/20 mix-blend-multiply z-0"></div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight drop-shadow-2xl">
          Find Your Next Vibe
        </h1>

        <p className="text-lg md:text-2xl max-w-2xl mx-auto drop-shadow-lg opacity-90 font-light">
          Discover unique, curated vintage and thrifted items from independent
          sellers
        </p>
      </div>

      {/* Scroll Down Animation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
        <span className="text-[10px] uppercase tracking-[0.5em] opacity-50 font-bold">
          Explore
        </span>

        {/* Animated Line */}
        <div className="relative w-[1px] h-16 bg-white/20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[#f8f1e5] animate-scroll-line"></div>
        </div>

        {/* Bouncing Arrow */}
        <div className="animate-bounce opacity-60">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </div>

      {/* Tailwind Custom Animation Style (Add this to your globals.css or a style tag) */}
      <style jsx>{`
        @keyframes scroll-line {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        .animate-scroll-line {
          animation: scroll-line 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </section>
  );
}
