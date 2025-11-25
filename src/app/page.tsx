import { Suspense } from "react";
import { FloatingShopButton } from "@/components/home/floating-shop-button";
import { HeroTiles } from "@/components/home/hero-tiles";
import { getHeroTiles } from "@/lib/data";

export default async function HomePage() {
  const tiles = await getHeroTiles();

  return (
    <div className="relative pb-24">
      <section className="flex flex-col gap-8 rounded-3xl bg-cream/80 p-12 text-cocoa shadow-md">
        <span className="inline-flex max-w-fit items-center gap-2 rounded-full bg-sage/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cocoa/70">
          Small-batch bakery
        </span>
        <h1 className="font-serif text-5xl font-semibold leading-tight">
          Cookies mixed by hand, baked to order, and delivered with a smile.
        </h1>
        <p className="max-w-2xl text-lg text-cocoa/75">
          Mundough celebrates the warmth of the oven and the joy of sharing.
          Browse our seasonal cookies and let us know what to bake next.
        </p>
      </section>

      <Suspense
        fallback={<div className="mt-12 text-cocoa/60">Loading treats...</div>}
      >
        <div className="mt-12">
          <HeroTiles tiles={tiles} />
        </div>
      </Suspense>

      <FloatingShopButton />
    </div>
  );
}
