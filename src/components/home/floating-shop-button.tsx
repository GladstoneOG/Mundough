"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function FloatingShopButton() {
  return (
    <Link
      href="/shop"
      className="group fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-caramel px-5 py-3 text-sm font-semibold text-cream shadow-2xl transition hover:translate-y-[-2px] hover:bg-caramel/90"
    >
      <ShoppingBag className="h-4 w-4" />
      Shop the menu
      <span className="inline-flex h-2 w-2 rounded-full bg-cream/80 transition group-hover:bg-cream" />
    </Link>
  );
}
