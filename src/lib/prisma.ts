import { PrismaClient } from "@prisma/client";

/**
 * Prisma client cached across hot reloads to prevent exhausting database connections.
 */
export const prisma = globalThis.prisma ?? new PrismaClient();

declare global {
  var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
