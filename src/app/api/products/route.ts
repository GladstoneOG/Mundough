import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
import { enforceAdmin } from "@/lib/admin-auth";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { variations: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const adminCheck = enforceAdmin(request);
  if (adminCheck) return adminCheck;

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.message },
      { status: 400 }
    );
  }

  const { title, description, imageUrl, isActive, variations } = parsed.data;

  const product = await prisma.product.create({
    data: {
      title,
      description,
      imageUrl,
      isActive,
      variations: {
        create: variations.map((variation) => ({
          name: variation.name,
          priceCents: variation.priceCents,
          sku: variation.sku,
        })),
      },
    },
    include: { variations: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ product });
}
