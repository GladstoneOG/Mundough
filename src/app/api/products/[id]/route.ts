import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
import { enforceAdmin } from "@/lib/admin-auth";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

const resolveParams = async (context: RouteContext) =>
  "then" in context.params ? await context.params : context.params;

export async function PATCH(request: Request, context: RouteContext) {
  const adminCheck = enforceAdmin(request);
  if (adminCheck) return adminCheck;

  const params = await resolveParams(context);
  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.message },
      { status: 400 }
    );
  }

  const existing = await prisma.product.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  const { title, description, imageUrl, isActive, variations } = parsed.data;
  const idsToPreserve = variations
    .map((variation) => variation.id)
    .filter((value): value is string => Boolean(value));

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      title,
      description,
      imageUrl,
      isActive,
      variations: {
        deleteMany: idsToPreserve.length
          ? {
              id: { notIn: idsToPreserve },
            }
          : {},
        upsert: variations
          .filter((variation) => variation.id)
          .map((variation) => ({
            where: { id: variation.id! },
            update: {
              name: variation.name,
              priceCents: variation.priceCents,
              sku: variation.sku,
            },
            create: {
              name: variation.name,
              priceCents: variation.priceCents,
              sku: variation.sku,
            },
          })),
        create: variations
          .filter((variation) => !variation.id)
          .map((variation) => ({
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

export async function DELETE(request: Request, context: RouteContext) {
  const adminCheck = enforceAdmin(request);
  if (adminCheck) return adminCheck;

  const params = await resolveParams(context);
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
