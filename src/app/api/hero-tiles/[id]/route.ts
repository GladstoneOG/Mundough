import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { heroTileSchema } from "@/lib/validators";
import { enforceAdmin } from "@/lib/admin-auth";
import { reorderHeroTiles } from "@/lib/reorder";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

const resolveParams = async (context: RouteContext) => {
  return "then" in context.params ? await context.params : context.params;
};

export async function PATCH(request: Request, context: RouteContext) {
  const adminCheck = enforceAdmin(request);
  if (adminCheck) return adminCheck;

  const params = await resolveParams(context);
  const body = await request.json();
  const parsed = heroTileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.message },
      { status: 400 }
    );
  }
  const tile = await prisma.heroTile.findUnique({ where: { id: params.id } });
  if (!tile) {
    return NextResponse.json({ message: "Tile not found" }, { status: 404 });
  }

  const { title, shortText, longText, imageUrl, order } = parsed.data;

  const updated = await prisma.heroTile.update({
    where: { id: params.id },
    data: {
      title,
      shortText,
      longText,
      imageUrl,
    },
  });

  if (typeof order === "number" && order >= 0 && order + 1 !== tile.order) {
    await reorderHeroTiles(params.id, order);
  }

  return NextResponse.json({ tile: updated });
}

export async function DELETE(request: Request, context: RouteContext) {
  const adminCheck = enforceAdmin(request);
  if (adminCheck) return adminCheck;

  const params = await resolveParams(context);
  await prisma.heroTile.delete({ where: { id: params.id } });

  const remaining = await prisma.heroTile.findMany({
    orderBy: { order: "asc" },
  });
  await prisma.$transaction(
    remaining.map((tile, index) =>
      prisma.heroTile.update({
        where: { id: tile.id },
        data: { order: index + 1 },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
