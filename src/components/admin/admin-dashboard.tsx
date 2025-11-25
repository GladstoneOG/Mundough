"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { HeroTile, Product, ProductVariation } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { HeroTileForm } from "@/components/admin/hero-tile-form";
import { ProductForm } from "@/components/admin/product-form";
import { adminFetch } from "@/lib/admin-fetch";
import { useAdminStore } from "@/stores/admin/admin-store";
import type { HeroTileInput, ProductInput } from "@/lib/validators";

export type ProductWithVariations = Product & { variations: ProductVariation[] };

type DialogState =
  | { type: "tile"; mode: "create"; payload?: null }
  | { type: "tile"; mode: "edit"; payload: HeroTile }
  | { type: "product"; mode: "create"; payload?: null }
  | { type: "product"; mode: "edit"; payload: ProductWithVariations }
  | null;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function AdminDashboard() {
  const isUnlocked = useAdminStore((state) => state.isUnlocked);
  const pinHash = useAdminStore((state) => state.pinHash) ?? undefined;

  const [tiles, setTiles] = useState<HeroTile[]>([]);
  const [products, setProducts] = useState<ProductWithVariations[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  const canManage = useMemo(() => isUnlocked && pinHash, [isUnlocked, pinHash]);

  useEffect(() => {
    if (!canManage) return;

    const run = async () => {
      setLoading(true);
      try {
        const tileRes = await fetch("/api/hero-tiles");
        const productRes = await fetch("/api/products");
        const tileJson = await tileRes.json();
        const productJson = await productRes.json();
        setTiles(tileJson.tiles ?? []);
        setProducts(productJson.products ?? []);
      } catch (error) {
        console.error(error);
        toast.error("Couldn't load the admin data");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [canManage]);

  const closeDialog = () => setDialog(null);

  const handleTileSubmit = async (values: HeroTileInput) => {
    if (!pinHash) return;

    try {
      const basePayload = {
        title: values.title,
        shortText: values.shortText,
        longText: values.longText,
        imageUrl: values.imageUrl,
      };

      if (!values.id) {
        const response = await adminFetch<{ tile: HeroTile }>("/api/hero-tiles", {
          method: "POST",
          body: JSON.stringify(basePayload),
          pinHash,
        });
        setTiles((current) => [...current, response.tile].sort((a, b) => a.order - b.order));
        toast.success("Tile added");
      } else {
        const existing = tiles.find((tile) => tile.id === values.id);
        const targetOrder =
          typeof values.order === "number"
            ? values.order
            : existing
              ? existing.order - 1
              : 0;

        const response = await adminFetch<{ tile: HeroTile }>(
          `/api/hero-tiles/${values.id}`,
          {
            method: "PATCH",
            pinHash,
            body: JSON.stringify({ ...basePayload, order: targetOrder }),
          },
        );
        setTiles((current) =>
          current
            .map((tile) => (tile.id === values.id ? response.tile : tile))
            .sort((a, b) => a.order - b.order),
        );
        toast.success("Tile updated");
      }

      closeDialog();
    } catch (error) {
      console.error(error);
      toast.error("Unable to save tile");
    }
  };

  const handleTileDelete = async (tile: HeroTile) => {
    if (!pinHash) return;
    try {
      await adminFetch(`/api/hero-tiles/${tile.id}`, {
        method: "DELETE",
        pinHash,
      });
      setTiles((current) =>
        current
          .filter((existing) => existing.id !== tile.id)
          .map((item, index) => ({ ...item, order: index + 1 })),
      );
      toast.success("Tile removed");
    } catch (error) {
      console.error(error);
      toast.error("Unable to remove tile");
    }
  };

  const moveTile = async (tile: HeroTile, direction: -1 | 1) => {
    if (!pinHash) return;
    const index = tiles.findIndex((item) => item.id === tile.id);
    const target = index + direction;
    if (target < 0 || target >= tiles.length) return;

    const ordered = [...tiles];
    const [removed] = ordered.splice(index, 1);
    ordered.splice(target, 0, removed);
    setTiles(ordered.map((item, position) => ({ ...item, order: position + 1 })));

    try {
      const response = await adminFetch<{ tile: HeroTile }>(`/api/hero-tiles/${tile.id}`, {
        method: "PATCH",
        pinHash,
        body: JSON.stringify({
          title: tile.title,
          shortText: tile.shortText,
          longText: tile.longText,
          imageUrl: tile.imageUrl,
          order: target,
        }),
      });

      setTiles((current) =>
        current
          .map((item) => (item.id === tile.id ? response.tile : item))
          .sort((a, b) => a.order - b.order),
      );
    } catch (error) {
      console.error(error);
      toast.error("Unable to reorder tile");
    }
  };

  const handleProductSubmit = async (values: ProductInput) => {
    if (!pinHash) return;

    try {
      const payload = {
        title: values.title,
        description: values.description,
        imageUrl: values.imageUrl,
        isActive: values.isActive,
        variations: values.variations.map((variation) => ({
          id: variation.id,
          name: variation.name,
          priceCents: variation.priceCents,
          sku: variation.sku ?? undefined,
        })),
      };

      if (!values.id) {
        const response = await adminFetch<{ product: ProductWithVariations }>(
          "/api/products",
          {
            method: "POST",
            pinHash,
            body: JSON.stringify(payload),
          },
        );
        setProducts((current) => [response.product, ...current]);
        toast.success("Product added");
      } else {
        const response = await adminFetch<{ product: ProductWithVariations }>(
          `/api/products/${values.id}`,
          {
            method: "PATCH",
            pinHash,
            body: JSON.stringify(payload),
          },
        );
        setProducts((current) =>
          current.map((product) => (product.id === values.id ? response.product : product)),
        );
        toast.success("Product updated");
      }

      closeDialog();
    } catch (error) {
      console.error(error);
      toast.error("Unable to save product");
    }
  };

  const handleProductDelete = async (product: ProductWithVariations) => {
    if (!pinHash) return;
    try {
      await adminFetch(`/api/products/${product.id}`, {
        method: "DELETE",
        pinHash,
      });
      setProducts((current) => current.filter((existing) => existing.id !== product.id));
      toast.success("Product removed");
    } catch (error) {
      console.error(error);
      toast.error("Unable to remove product");
    }
  };

  if (!isUnlocked) {
    return (
      <div className="space-y-6 rounded-3xl bg-cream/70 p-12 text-center shadow-lg">
        <h1 className="font-serif text-3xl">Admin access required</h1>
        <p className="text-sm text-cocoa/70">
          Tap the Mundough wordmark in the header five times, enter the PIN, and revisit this page to manage tiles and products.
        </p>
      </div>
    );
  }

  if (!pinHash) {
    return (
      <div className="rounded-3xl bg-cream/70 p-12 text-center shadow-lg">
        <p className="text-sm text-cocoa/70">Unlock admin mode to continue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="space-y-6 rounded-3xl bg-cream/85 p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl">Home hero tiles</h2>
            <p className="text-sm text-cocoa/70">
              Drag order by using the move buttons. Updates go live as soon as you save.
            </p>
          </div>
          <Button onClick={() => setDialog({ type: "tile", mode: "create" })}>New tile</Button>
        </div>

        {loading && !tiles.length ? (
          <p className="text-sm text-cocoa/60">Loading tiles...</p>
        ) : null}

        <div className="space-y-4">
          {tiles.map((tile, index) => (
            <div
              key={tile.id}
              className="flex flex-col gap-4 rounded-2xl border border-caramel/20 bg-white/80 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-caramel/70">#{index + 1}</p>
                <h3 className="font-semibold text-cocoa">{tile.title}</h3>
                <p className="text-sm text-cocoa/70">{tile.shortText}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => moveTile(tile, -1)}
                  disabled={index === 0}
                >
                  Move up
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => moveTile(tile, 1)}
                  disabled={index === tiles.length - 1}
                >
                  Move down
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDialog({ type: "tile", mode: "edit", payload: tile })}
                >
                  Edit
                </Button>
                <Button variant="ghost" onClick={() => handleTileDelete(tile)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl bg-cream/85 p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl">Store catalog</h2>
            <p className="text-sm text-cocoa/70">
              {"Toggle availability, adjust pricing, and keep variations in sync with what's in the case."}
            </p>
          </div>
          <Button onClick={() => setDialog({ type: "product", mode: "create" })}>New product</Button>
        </div>

        {loading && !products.length ? (
          <p className="text-sm text-cocoa/60">Loading products...</p>
        ) : null}

        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col gap-4 rounded-2xl border border-caramel/20 bg-white/80 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-caramel/70">
                    {product.isActive ? "Live" : "Hidden"}
                  </p>
                  <h3 className="font-semibold text-cocoa">{product.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDialog({ type: "product", mode: "edit", payload: product })}
                  >
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => handleProductDelete(product)}>
                    Delete
                  </Button>
                </div>
              </div>
              <p className="text-sm text-cocoa/70">{product.description}</p>
              <ul className="space-y-2 text-sm text-cocoa/70">
                {product.variations.map((variation) => (
                  <li key={variation.id}>
                    {variation.name} - {currency.format(variation.priceCents / 100)} - {variation.sku ?? "No SKU"}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Dialog
        open={dialog?.type === "tile"}
        onClose={closeDialog}
        title={dialog?.mode === "edit" ? "Update hero tile" : "New hero tile"}
        footer={null}
      >
        {dialog?.type === "tile" ? (
          <HeroTileForm
            initial={dialog.mode === "edit" ? dialog.payload : undefined}
            onSubmit={handleTileSubmit}
            onCancel={closeDialog}
            submitLabel={dialog.mode === "edit" ? "Save changes" : "Publish tile"}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={dialog?.type === "product"}
        onClose={closeDialog}
        title={dialog?.mode === "edit" ? "Update product" : "New product"}
        footer={null}
      >
        {dialog?.type === "product" ? (
          <ProductForm
            initial={dialog.mode === "edit" ? dialog.payload : undefined}
            onSubmit={handleProductSubmit}
            onCancel={closeDialog}
            submitLabel={dialog.mode === "edit" ? "Save changes" : "Add product"}
          />
        ) : null}
      </Dialog>
    </div>
  );
}
