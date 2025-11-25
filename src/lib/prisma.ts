import { PrismaClient } from "@prisma/client";

/**
 * Prisma client cached across hot reloads to prevent exhausting database connections.
 */
export const prisma = globalThis.prisma ?? new PrismaClient();

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
