"use client";

import Image from "next/image";
import toast from "react-hot-toast";
import { UploadButton } from "@uploadthing/react";
import type { UploadRouter } from "@/app/api/uploadthing/core";
import { getAdminPinHash } from "@/stores/admin/admin-store";

type ImageUploaderProps = {
  endpoint: keyof UploadRouter;
  label: string;
  value?: string;
  onChange: (url: string) => void;
};

export function ImageUploader({ endpoint, label, value, onChange }: ImageUploaderProps) {
  const pinHash = getAdminPinHash();

  if (!pinHash) {
    return (
      <div className="rounded-2xl border border-dashed border-caramel/30 bg-cream/60 p-4 text-sm text-cocoa/60">
        Unlock the admin PIN to upload a photo.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl border border-dashed border-caramel/30 bg-cream/60">
        {value ? (
          <Image src={value} alt={label} width={800} height={450} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-cocoa/50">
            No image selected yet
          </div>
        )}
      </div>
      <UploadButton<UploadRouter, keyof UploadRouter>
        endpoint={endpoint}
        headers={() => ({ "x-admin-pin-hash": pinHash ?? "" })}
        onClientUploadComplete={(res: Array<{ url: string }> | undefined) => {
          const file = res?.[0];
          if (file?.url) {
            onChange(file.url);
          }
        }}
        onUploadError={(error: Error) => {
          console.error(error);
          toast.error(error.message ?? "Upload failed");
        }}
        appearance={{
          button: "ut-ready:border ut-ready:border-caramel/40 ut-ready:bg-white ut-ready:text-caramel ut-uploading:bg-caramel/80 ut-uploading:text-cream",
        }}
        content={{
          button: value ? "Replace image" : "Upload image",
        }}
      />
    </div>
  );
}
