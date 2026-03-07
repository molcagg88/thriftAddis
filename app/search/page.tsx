import { createSupabaseServerClient } from "@/utils/supabase/server";
import ProductCard from "@/components/marketplace/product-card";
import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // 1. Await the searchParams (Required in Next.js 15+)
  const { q } = await searchParams;
  const query = q || "";

  // 2. Initialize the authenticated Supabase Server Client
  const supabase = await createSupabaseServerClient();

  // 3. Fetch results using the joined profiles for Thrift Addis branding
  const { data: results, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      profiles (display_name, avatar_url)
    `,
    )
    .or(
      `title.ilike.%${query}%,description.ilike.%${query}%,tags.ilike.%${query}%`,
    )
    .neq("status", "closed") // Keep "closed" items hidden
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Search fetch error:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Search Results
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {results?.length || 0} items found for{" "}
            <span className="text-green-600">"{query}"</span>
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 text-green-600 font-bold hover:text-green-700 transition-colors group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Marketplace
        </Link>
      </div>

      <hr className="border-gray-100 mb-10" />

      {results && results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {results.map((item) => (
            <ProductCard
              key={item.id}
              sellerName={item.profiles.display_name}
              product={item}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <SearchX size={48} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No matches found</h3>
          <p className="text-gray-500 mt-2 max-w-xs text-center">
            We couldn't find anything matching your search. Try checking your
            spelling or using more general terms.
          </p>
          <Link
            href="/"
            className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
          >
            Browse All Items
          </Link>
        </div>
      )}
    </div>
  );
}
