import { prisma } from "@/lib/prisma";

export async function reorderHeroTiles(tileId: string, desiredIndex: number) {
  const tiles = await prisma.heroTile.findMany({ orderBy: { order: "asc" } });
  const currentIndex = tiles.findIndex((tile) => tile.id === tileId);
  if (currentIndex === -1) return;

  const safeIndex = Math.max(0, Math.min(desiredIndex, tiles.length - 1));
  const [tile] = tiles.splice(currentIndex, 1);
  tiles.splice(safeIndex, 0, tile);

  await prisma.$transaction(
    tiles.map((tile, index) =>
      prisma.heroTile.update({
        where: { id: tile.id },
        data: { order: index + 1 },
      }),
    ),
  );
}
