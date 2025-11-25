import { prisma } from "@/lib/prisma";

export async function getHeroTiles() {
  return prisma.heroTile.findMany({
    orderBy: { order: "asc" },
  });
}

export async function getProductsWithVariations() {
  return prisma.product.findMany({
    where: { isActive: true },
    include: { variations: { orderBy: { priceCents: "asc" } } },
    orderBy: { title: "asc" },
  });
}

export async function getAllProducts() {
  return prisma.product.findMany({
    include: { variations: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}
