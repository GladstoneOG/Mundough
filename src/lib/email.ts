import { Resend } from "resend";
import { config, isEmailConfigured } from "@/lib/config";
import type { CheckoutInput } from "@/lib/validators";

const resendApiKey = process.env.RESEND_API_KEY;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export type CheckoutEmailItem = {
  productTitle: string;
  variationName: string;
  quantity: number;
  priceCents: number;
};

export async function sendCheckoutEmail({
  contact,
  items,
  totalCents,
}: {
  contact: CheckoutInput;
  items: CheckoutEmailItem[];
  totalCents: number;
}) {
  if (!resend || !isEmailConfigured()) {
    console.warn("Checkout email skipped: Resend not configured");
    return;
  }

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const lines = items
    .map(
      (item) =>
        `${item.quantity} x ${item.productTitle} (${item.variationName}) — ${currency.format(
          item.priceCents / 100,
        )}`,
    )
    .join("\n");

  const text = `New Mundough cart submission\n\n` +
    `Name: ${contact.name}\n` +
    (contact.email ? `Email: ${contact.email}\n` : "") +
    `Phone: ${contact.phone}\n` +
    `Address: ${contact.address}\n` +
    (contact.notes ? `Notes: ${contact.notes}\n` : "") +
    `\nItems:\n${lines}\n\nTotal: ${currency.format(totalCents / 100)}`;

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; color: #2f2117;">
      <h1>New Mundough cart submission</h1>
      <p><strong>Name:</strong> ${contact.name}</p>
      ${contact.email ? `<p><strong>Email:</strong> ${contact.email}</p>` : ""}
      <p><strong>Phone:</strong> ${contact.phone}</p>
      <p><strong>Address:</strong> ${contact.address}</p>
      ${contact.notes ? `<p><strong>Notes:</strong> ${contact.notes}</p>` : ""}
      <h2>Items</h2>
      <ul>
        ${items
          .map(
            (item) =>
              `<li>${item.quantity} × <strong>${item.productTitle}</strong> (${item.variationName}) — ${currency.format(
                item.priceCents / 100,
              )}</li>`,
          )
          .join("")}
      </ul>
      <p><strong>Total:</strong> ${currency.format(totalCents / 100)}</p>
    </div>
  `;

  await resend.emails.send({
    from: config.checkoutEmailFrom,
    to: config.checkoutEmailTo,
    subject: `Mundough cart submission — ${contact.name}`,
    text,
    html,
  });
}
