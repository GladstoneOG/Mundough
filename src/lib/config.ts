export const config = {
  adminPinHash: process.env.NEXT_PUBLIC_ADMIN_PIN_HASH ?? "",
  checkoutEmailFrom: process.env.CHECKOUT_FROM_EMAIL ?? "",
  checkoutEmailTo: process.env.CHECKOUT_NOTIFICATION_EMAIL ?? "",
  siteName: "Mundough",
};

export const isEmailConfigured = () =>
  config.checkoutEmailFrom.length > 0 && config.checkoutEmailTo.length > 0;
