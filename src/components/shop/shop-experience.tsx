"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { Product, ProductVariation } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type CheckoutInput,
  checkoutSchema,
} from "@/lib/validators";
import {
  selectCartCount,
  selectCartTotal,
  useCartStore,
} from "@/stores/cart-store";

export type ProductWithVariations = Product & {
  variations: ProductVariation[];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type Props = {
  products: ProductWithVariations[];
};

export function ShopExperience({ products }: Props) {
  const [isCartOpen, setCartOpen] = useState(false);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clear);
  const cartCount = useCartStore(selectCartCount);
  const cartTotal = useCartStore(selectCartTotal);

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!items.length) {
      toast.error("Add a treat before checking out");
      return;
    }

    const payload = {
      contact: values,
      items: items.map((line) => ({
        productId: line.productId,
        variationId: line.variationId,
        quantity: line.quantity,
      })),
    };

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      toast.error(body.message ?? "We couldn't send your order. Try again.");
      return;
    }

    clearCart();
    form.reset();
    setCheckoutOpen(false);
    setCartOpen(false);
    toast.success("We'll get in touch shortly.");
  });

  const cartWithTotals = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        lineTotal: item.priceCents * item.quantity,
      })),
    [items],
  );

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-semibold">Shop Mundough</h1>
          <p className="text-cocoa/70">
            Choose your cravings, add a note, and we'll confirm availability and delivery windows with you directly.
          </p>
        </div>
        <Button onClick={() => setCartOpen(true)} className="relative">
          View cart
          {cartCount ? (
            <span className="absolute -right-2 -top-2 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-raspberry px-1 text-xs text-cream">
              {cartCount}
            </span>
          ) : null}
        </Button>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-cream/80 shadow-lg transition hover:-translate-y-1"
          >
            <div className="relative h-64 w-full overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 540px"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-6 text-cream">
                <h2 className="font-serif text-3xl font-semibold">{product.title}</h2>
              </div>
            </div>
            <div className="flex flex-grow flex-col gap-6 p-6">
              <p className="text-sm text-cocoa/75">{product.description}</p>
              <div className="flex flex-col gap-3">
                {product.variations.map((variation) => (
                  <div
                    key={variation.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-caramel/20 bg-white/80 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-cocoa">
                        {variation.name}
                      </p>
                      <p className="text-xs text-cocoa/60">
                        {variation.sku ?? "Fresh batch"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-caramel">
                        {currency.format(variation.priceCents / 100)}
                      </span>
                      <Button
                        onClick={() => {
                          addItem(
                            {
                              productId: product.id,
                              productTitle: product.title,
                              variationId: variation.id,
                              variationName: variation.name,
                              priceCents: variation.priceCents,
                            },
                            1,
                          );
                          toast.success(`${variation.name} added`);
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={isCartOpen}
        onClose={() => setCartOpen(false)}
        title="Your cart"
        footer={
          items.length ? (
            <>
              <Button type="button" variant="outline" onClick={clearCart}>
                Clear cart
              </Button>
              <Button type="button" onClick={() => setCheckoutOpen(true)}>
                Checkout
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => setCartOpen(false)}>
              Close
            </Button>
          )
        }
      >
        {items.length ? (
          <div className="space-y-4">
            {cartWithTotals.map((item) => (
              <div
                key={`${item.productId}-${item.variationId}`}
                className="flex items-center justify-between gap-4 rounded-2xl bg-cream/80 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-cocoa">{item.productTitle}</p>
                  <p className="text-xs text-cocoa/60">{item.variationName}</p>
                  <p className="text-xs text-cocoa/70">
                    {currency.format(item.priceCents / 100)} each
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-cocoa/60">
                    Qty
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(
                          item.productId,
                          item.variationId,
                          Number(event.target.value) || 1,
                        )
                      }
                      className="h-9 w-16 text-center"
                    />
                  </label>
                  <span className="w-24 text-right text-sm font-semibold text-caramel">
                    {currency.format(item.lineTotal / 100)}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => removeItem(item.productId, item.variationId)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 font-semibold text-cocoa">
              <span>Total</span>
              <span>{currency.format(cartTotal / 100)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-cocoa/70">
            The cart is empty—add a treat to start your order.
          </p>
        )}
      </Dialog>

      <Dialog
        open={isCheckoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Checkout"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => onSubmit()}>
              Send order
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-cocoa/80" htmlFor="name">
              Full name
            </label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-xs text-raspberry">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-cocoa/80" htmlFor="email">
              Email
            </label>
            <Input id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-xs text-raspberry">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-cocoa/80" htmlFor="phone">
              Phone number
            </label>
            <Input id="phone" {...form.register("phone")} />
            {form.formState.errors.phone ? (
              <p className="text-xs text-raspberry">
                {form.formState.errors.phone.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-cocoa/80" htmlFor="address">
              Delivery address or pickup preference
            </label>
            <Textarea id="address" rows={3} {...form.register("address")} />
            {form.formState.errors.address ? (
              <p className="text-xs text-raspberry">
                {form.formState.errors.address.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-cocoa/80" htmlFor="notes">
              Notes (allergies, timing, favorite flavors)
            </label>
            <Textarea id="notes" rows={3} {...form.register("notes")} />
            {form.formState.errors.notes ? (
              <p className="text-xs text-raspberry">
                {form.formState.errors.notes.message}
              </p>
            ) : null}
          </div>
        </form>
      </Dialog>
    </div>
  );
}
