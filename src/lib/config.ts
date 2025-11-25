export const config = {
  adminPinHash: process.env.NEXT_PUBLIC_ADMIN_PIN_HASH ?? "",
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
    process.env.WHATSAPP_NUMBER ??
    "",
  siteName: "Mundough",
};
