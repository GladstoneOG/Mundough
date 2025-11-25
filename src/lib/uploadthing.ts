import { isPinHashAuthorized } from "@/lib/pin";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const uploadRouter = {
  heroTileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const header = req.headers.get("x-admin-pin-hash") ?? "";
      if (!isPinHashAuthorized(header)) {
        throw new UploadThingError("UNAUTHORIZED");
      }
      return { pinHash: header };
    })
    .onUploadComplete(async ({ file }) => ({ url: file.url })),
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const header = req.headers.get("x-admin-pin-hash") ?? "";
      if (!isPinHashAuthorized(header)) {
        throw new UploadThingError("UNAUTHORIZED");
      }
      return { pinHash: header };
    })
    .onUploadComplete(async ({ file }) => ({ url: file.url })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
