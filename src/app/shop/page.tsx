import type { Metadata } from "next";
import { ShopExperience } from "@/components/shop/shop-experience";
import { getProductsWithVariations } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop • Mundough",
  description:
    "Browse Mundough's cookie case, add your favorites to the cart, and we'll confirm your order personally.",
};

export default async function ShopPage() {
  const products = await getProductsWithVariations();
  return <ShopExperience products={products} />;
}
