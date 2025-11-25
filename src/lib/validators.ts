import { z } from "zod";

export const heroTileSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "A title is required").max(80),
  shortText: z
    .string()
    .min(4, "Add a short teaser")
    .max(160, "Keep this intro snappy"),
  longText: z
    .string()
    .min(10, "Give guests a bit more to savor"),
  imageUrl: z.string().url("Enter a valid image URL"),
  order: z.number().int().min(0).optional(),
});

export type HeroTileInput = z.infer<typeof heroTileSchema>;

export const productVariationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variation name is required"),
  priceCents: z
    .number({ invalid_type_error: "Price is required" })
    .int("Price must be a whole number")
    .min(0, "Price cannot be negative"),
  sku: z
    .string()
    .max(48)
    .optional()
    .transform((value) => (value ? value.trim() : undefined)),
});

export type ProductVariationInput = z.infer<typeof productVariationSchema>;

export const productSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "A product title is required"),
  description: z.string().min(10, "A description helps customers decide"),
  imageUrl: z.string().url("Enter a valid image URL"),
  isActive: z.boolean().default(true),
  variations: z
    .array(productVariationSchema)
    .min(1, "Add at least one variation"),
});

export type ProductInput = z.infer<typeof productSchema>;

export const checkoutSchema = z.object({
  name: z.string().min(2, "Let us know who you are"),
  email: z
    .string()
    .email("Provide a valid email")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  phone: z
    .string()
    .min(7, "Phone number seems short")
    .max(32, "Phone number seems long"),
  address: z
    .string()
    .min(5, "We need somewhere to deliver")
    .max(240, "Address is a touch long"),
  notes: z
    .string()
    .max(240)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
