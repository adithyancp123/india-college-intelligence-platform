import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prismaInstance: PrismaClient | null = null;
let isDatabaseOnline = false;

// Safe initialization function
function initPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('DATABASE_URL is not set. Falling back to local JSON database.');
    return null;
  }

  try {
    const pool = new Pool({
      connectionString,
      // Connect timeout
      connectionTimeoutMillis: 2000,
    });

    const adapter = new PrismaPg(pool);
    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    return client;
  } catch (error) {
    console.error('Failed to initialize Prisma with PG adapter:', error);
    return null;
  }
}

// Global caching for Hot Module Replacement in dev mode
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null;
  isDbChecked: boolean;
};

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = initPrisma();
}

export const prisma = globalForPrisma.prisma;

// Helper to check if database is online
export async function checkDatabaseConnection(): Promise<boolean> {
  if (!prisma) {
    isDatabaseOnline = false;
    return false;
  }
  try {
    // Simple fast query to check connection
    await prisma.$queryRaw`SELECT 1`;
    isDatabaseOnline = true;
    return true;
  } catch (error) {
    // Suppress verbose stack trace for connection failure
    console.warn('PostgreSQL database is offline or unreachable. Using local JSON database.');
    isDatabaseOnline = false;
    return false;
  }
}
