"use client";

import Image from "next/image";
import { useState } from "react";
import type { HeroTile } from "@prisma/client";
import { Button } from "@/components/ui/button";

type HeroTilesProps = {
  tiles: HeroTile[];
};

export function HeroTiles({ tiles }: HeroTilesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!tiles.length) {
    return (
      <section className="rounded-3xl bg-cream/80 p-12 text-center shadow-lg">
        <p className="font-serif text-2xl text-cocoa/60">
          We're warming up the oven. Check back soon for fresh treats.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-10">
      {tiles.map((tile) => {
        const isExpanded = expandedId === tile.id;
        return (
          <article
            key={tile.id}
            className="group relative overflow-hidden rounded-3xl shadow-xl"
          >
            <div className="absolute inset-0">
              <Image
                src={tile.imageUrl}
                alt={tile.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 1100px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f140d]/80 via-[#1f140d]/30 to-transparent" />
            </div>
            <div className="relative flex h-[480px] flex-col justify-end gap-4 p-10 text-cream">
              <div className="max-w-xl space-y-3">
                <span className="inline-flex items-center rounded-full bg-caramel/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cream/90">
                  Fresh from our oven
                </span>
                <h2 className="font-serif text-4xl font-semibold drop-shadow-sm">
                  {tile.title}
                </h2>
                <p className="text-lg text-cream/90">{tile.shortText}</p>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="border-white/60 bg-white/10 text-cream hover:bg-white/20"
                  onClick={() => setExpandedId(isExpanded ? null : tile.id)}
                >
                  {isExpanded ? "Hide story" : "Read more"}
                </Button>
              </div>
            </div>
            {isExpanded ? (
              <div className="relative bg-cream/95 p-8 text-cocoa shadow-inner">
                <p className="max-w-3xl text-base leading-relaxed text-cocoa/80">
                  {tile.longText}
                </p>
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
