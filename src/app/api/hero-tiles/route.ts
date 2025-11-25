import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { heroTileSchema } from "@/lib/validators";
import { enforceAdmin } from "@/lib/admin-auth";

export async function GET() {
  const tiles = await prisma.heroTile.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json({ tiles });
}

export async function POST(request: Request) {
  const adminCheck = enforceAdmin(request as any);
  if (adminCheck) return adminCheck;

  const body = await request.json();
  const parsed = heroTileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.message }, { status: 400 });
  }

  const { title, shortText, longText, imageUrl } = parsed.data;
  const maxOrder = await prisma.heroTile.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? 0) + 1;

  const tile = await prisma.heroTile.create({
    data: {
      title,
      shortText,
      longText,
      imageUrl,
      order,
    },
  });

  return NextResponse.json({ tile });
}
