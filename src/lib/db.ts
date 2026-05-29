
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let isDatabaseOnline = false;

function initPrisma(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;

  if (
    !connectionString ||
    connectionString === "postgresql://placeholder"
  ) {
    console.warn(
      "DATABASE_URL is missing or placeholder. Falling back to local JSON database."
    );
    return null;
  }

  try {
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 2000,
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  } catch (error) {
    console.error("Failed to initialize Prisma:", error);
    return null;
  }
}

export const prisma =
  global.prisma ?? initPrisma() ?? undefined;

if (process.env.NODE_ENV !== "production" && prisma) {
  global.prisma = prisma;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  if (!prisma) {
    isDatabaseOnline = false;
    return false;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    isDatabaseOnline = true;
    return true;
  } catch {
    console.warn(
      "PostgreSQL unavailable. Using local JSON fallback database."
    );
    isDatabaseOnline = false;
    return false;
  }
}

export function isDbOnline(): boolean {
  return isDatabaseOnline;
}
