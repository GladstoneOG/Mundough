import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getHeroTiles() {
  noStore();
  return prisma.heroTile.findMany({
    orderBy: { order: "asc" },
  });
}

export async function getProductsWithVariations() {
  noStore();
  return prisma.product.findMany({
    where: { isActive: true },
    include: { variations: { orderBy: { priceCents: "asc" } } },
    orderBy: { title: "asc" },
  });
}

export async function getAllProducts() {
  noStore();
  return prisma.product.findMany({
    include: { variations: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}
