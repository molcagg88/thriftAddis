import { getListings } from "@/lib/data";
import ProductGridUI from "../ui/sections/ProductGridUI";
import { ProductCard } from "./product-card";
import { ListingWithProfile } from "@/types";

export async function ProductGrid() {
  const listings: ListingWithProfile[] = await getListings();
  return <ProductGridUI listings={listings} />;
}
