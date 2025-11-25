"use client";

import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Product, ProductVariation } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/image-uploader";
import { productSchema, type ProductInput } from "@/lib/validators";

export type ProductFormProps = {
  initial?: Product & { variations: ProductVariation[] };
  onSubmit: (values: ProductInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
};

const emptyVariation = (): ProductInput["variations"][number] => ({
  name: "",
  priceCents: 0,
  sku: undefined,
});

export function ProductForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save product",
}: ProductFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const defaultVariations = useMemo(
    () =>
      initial
        ? initial.variations.map((variation) => ({
            id: variation.id,
            name: variation.name,
            priceCents: variation.priceCents,
            sku: variation.sku ?? undefined,
          }))
        : [emptyVariation()],
    [initial]
  );

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      imageUrl: initial?.imageUrl ?? "",
      isActive: initial?.isActive ?? true,
      variations: defaultVariations,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variations",
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      await onSubmit({ ...values, id: initial?.id });
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="title">Product name</Label>
        <Input id="title" {...form.register("title")} />
        {form.formState.errors.title ? (
          <p className="text-xs text-raspberry">
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} {...form.register("description")} />
        {form.formState.errors.description ? (
          <p className="text-xs text-raspberry">
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label>Feature photo</Label>
        <ImageUploader
          endpoint="productImage"
          label="Product photo"
          value={form.watch("imageUrl")}
          onChange={(url) =>
            form.setValue("imageUrl", url, { shouldValidate: true })
          }
        />
        {form.formState.errors.imageUrl ? (
          <p className="text-xs text-raspberry">
            {form.formState.errors.imageUrl.message}
          </p>
        ) : null}
      </div>

      <label className="flex items-center gap-3 text-sm text-cocoa/80">
        <input type="checkbox" {...form.register("isActive")} />
        Visible in the storefront
      </label>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-cocoa">Variations</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => append(emptyVariation())}
            disabled={fields.length >= 6}
          >
            Add variation
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => {
            const error = form.formState.errors.variations?.[index];
            const priceCents =
              form.watch(`variations.${index}.priceCents`) ?? 0;
            const priceValue = priceCents / 100;
            return (
              <div
                key={field.id}
                className="rounded-2xl border border-caramel/20 bg-cream/70 p-4"
              >
                <input
                  type="hidden"
                  {...form.register(`variations.${index}.priceCents`, {
                    valueAsNumber: true,
                  })}
                />
                <div className="grid gap-2">
                  <Label htmlFor={`variation-name-${field.id}`}>Name</Label>
                  <Input
                    id={`variation-name-${field.id}`}
                    {...form.register(`variations.${index}.name`)}
                  />
                  {error?.name ? (
                    <p className="text-xs text-raspberry">
                      {error.name.message}
                    </p>
                  ) : null}
                </div>

                <div className="mt-3 grid gap-2">
                  <Label htmlFor={`variation-sku-${field.id}`}>
                    SKU / Note
                  </Label>
                  <Input
                    id={`variation-sku-${field.id}`}
                    placeholder="Optional"
                    {...form.register(`variations.${index}.sku`)}
                  />
                  {error?.sku ? (
                    <p className="text-xs text-raspberry">
                      {error.sku.message as string}
                    </p>
                  ) : null}
                </div>

                <div className="mt-3 grid gap-2">
                  <Label htmlFor={`variation-price-${field.id}`}>
                    Price (USD)
                  </Label>
                  <Input
                    id={`variation-price-${field.id}`}
                    type="number"
                    min={0}
                    step="0.5"
                    value={Number.isFinite(priceValue) ? priceValue : 0}
                    onChange={(event) => {
                      const nextValue = Math.round(
                        parseFloat(event.target.value || "0") * 100
                      );
                      form.setValue(
                        `variations.${index}.priceCents`,
                        isNaN(nextValue) ? 0 : nextValue,
                        {
                          shouldValidate: true,
                        }
                      );
                    }}
                  />
                  {error?.priceCents ? (
                    <p className="text-xs text-raspberry">
                      {error.priceCents.message}
                    </p>
                  ) : null}
                </div>

                {fields.length > 1 ? (
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => remove(index)}
                    >
                      Remove variation
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
