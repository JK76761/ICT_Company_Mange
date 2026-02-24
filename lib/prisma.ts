import type { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __rims_prisma__: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __rims_prisma_unavailable__: boolean | undefined;
  // eslint-disable-next-line no-var
  var __rims_prisma_warned__: boolean | undefined;
}

function isPrismaEnabledByEnv(): boolean {
  if (process.env.RIMS_DATA_MODE === "memory") {
    return false;
  }

  return Boolean(process.env.DATABASE_URL);
}

export function isDatabaseModeRequested(): boolean {
  return isPrismaEnabledByEnv();
}

export async function getPrismaClient(): Promise<PrismaClient | null> {
  if (!isPrismaEnabledByEnv()) {
    return null;
  }

  if (globalThis.__rims_prisma_unavailable__) {
    return null;
  }

  if (!globalThis.__rims_prisma__) {
    try {
      const prismaModule = await import("@prisma/client");
      const PrismaClient = prismaModule.PrismaClient;
      globalThis.__rims_prisma__ = new PrismaClient();
    } catch (error) {
      globalThis.__rims_prisma_unavailable__ = true;

      if (process.env.NODE_ENV !== "production" && !globalThis.__rims_prisma_warned__) {
        globalThis.__rims_prisma_warned__ = true;
        console.warn(
          "[RIMS] Prisma unavailable; falling back to in-memory store.",
          error instanceof Error ? error.message : String(error)
        );
      }

      return null;
    }
  }

  return globalThis.__rims_prisma__ ?? null;
}
