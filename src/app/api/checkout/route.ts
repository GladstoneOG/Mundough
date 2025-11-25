import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators";
import { sendCheckoutEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const contactResult = checkoutSchema.safeParse(body.contact);
  if (!contactResult.success) {
    return NextResponse.json({ message: contactResult.error.message }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { message: "Add at least one item before checking out" },
      { status: 400 },
    );
  }

  type IncomingItem = { productId: string; variationId: string; quantity: number };

  const items = body.items.filter((item: unknown): item is IncomingItem =>
    Boolean(
      item &&
        typeof item === "object" &&
        typeof (item as any).productId === "string" &&
        typeof (item as any).variationId === "string" &&
        typeof (item as any).quantity === "number",
    ),
  );

  if (items.length === 0) {
    return NextResponse.json({ message: "Invalid line items" }, { status: 400 });
  }

  const variationIds = items.map((item: IncomingItem) => item.variationId);
  const variations = await prisma.productVariation.findMany({
    where: { id: { in: variationIds } },
    include: { product: true },
  });

  const variationMap = new Map(variations.map((variation) => [variation.id, variation]));

  const missingVariation = items.find(
    (item: IncomingItem) => !variationMap.has(item.variationId),
  );
  if (missingVariation) {
    return NextResponse.json(
      { message: `Variation ${missingVariation.variationId} is unavailable` },
      { status: 400 },
    );
  }

  const detailedItems = items.map((item: IncomingItem) => {
    const variation = variationMap.get(item.variationId)!;
    return {
      productTitle: variation.product.title,
      variationName: variation.name,
      priceCents: variation.priceCents,
      quantity: Math.max(1, item.quantity ?? 1),
    };
  });

  const totalCents = detailedItems.reduce(
    (total: number, item: (typeof detailedItems)[number]) =>
      total + item.priceCents * item.quantity,
    0,
  );

  await sendCheckoutEmail({
    contact: contactResult.data,
    items: detailedItems,
    totalCents,
  });

  return NextResponse.json({ ok: true });
}
