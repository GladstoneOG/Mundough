import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators";
import { config } from "@/lib/config";

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

  const candidateItems = Array.isArray(body.items) ? body.items : [];

  const items = candidateItems.filter((item: unknown): item is IncomingItem => {
    if (!item || typeof item !== "object") return false;
    const record = item as Record<string, unknown>;
    return (
      typeof record.productId === "string" &&
      typeof record.variationId === "string" &&
      typeof record.quantity === "number"
    );
  });

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

  const phoneDigits = config.whatsappNumber.replace(/[^0-9]/g, "");
  if (!phoneDigits) {
    return NextResponse.json(
      { message: "WhatsApp number is not configured" },
      { status: 500 },
    );
  }

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const lines = detailedItems
    .map((item: (typeof detailedItems)[number]) =>
      `• ${item.quantity} x ${item.productTitle} (${item.variationName}) - ${currency.format(
        item.priceCents / 100,
      )}`,
    )
    .join("\n");

  const contact = contactResult.data;

  const message = `Hi! I'd love to order from ${config.siteName}.\n\n` +
    `Name: ${contact.name}\n` +
    (contact.email ? `Email: ${contact.email}\n` : "") +
    `Phone: ${contact.phone}\n` +
    `Address: ${contact.address}\n` +
    (contact.notes ? `Notes: ${contact.notes}\n` : "") +
    `\nOrder:\n${lines}\n\nTotal: ${currency.format(totalCents / 100)}\n\nSent from mundough.com`;

  const redirectUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;

  return NextResponse.json({ ok: true, redirectUrl });
}
