import { config } from "@/lib/config";

/**
 * Normalizes a raw PIN into a SHA-256 hex digest. Works in both browser and server contexts.
 */
export async function hashPin(pin: string): Promise<string> {
  if (typeof window === "undefined") {
    const crypto = await import("node:crypto");
    return crypto.createHash("sha256").update(pin).digest("hex");
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function validatePin(pin: string): Promise<boolean> {
  if (!config.adminPinHash) return false;
  const candidate = await hashPin(pin);
  return candidate === config.adminPinHash;
}

export const isPinHashAuthorized = (hash: string) =>
  Boolean(hash && config.adminPinHash && hash === config.adminPinHash);
