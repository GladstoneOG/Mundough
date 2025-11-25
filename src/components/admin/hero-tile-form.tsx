"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { HeroTile } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { heroTileSchema, type HeroTileInput } from "@/lib/validators";
import { ImageUploader } from "@/components/admin/image-uploader";

export type HeroTileFormProps = {
  initial?: HeroTile;
  onSubmit: (values: HeroTileInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
};

export function HeroTileForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save tile",
}: HeroTileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<HeroTileInput>({
    resolver: zodResolver(heroTileSchema),
    defaultValues: {
      title: initial?.title ?? "",
      shortText: initial?.shortText ?? "",
      longText: initial?.longText ?? "",
      imageUrl: initial?.imageUrl ?? "",
    },
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
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register("title")} />
        {form.formState.errors.title ? (
          <p className="text-xs text-raspberry">
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="shortText">Short blurb</Label>
        <Textarea id="shortText" rows={2} {...form.register("shortText")} />
        {form.formState.errors.shortText ? (
          <p className="text-xs text-raspberry">
            {form.formState.errors.shortText.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="longText">Long description</Label>
        <Textarea id="longText" rows={5} {...form.register("longText")} />
        {form.formState.errors.longText ? (
          <p className="text-xs text-raspberry">
            {form.formState.errors.longText.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label>Image</Label>
        <ImageUploader
          endpoint="heroTileImage"
          label="Hero tile image"
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
