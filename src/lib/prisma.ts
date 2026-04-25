import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// Cache bust: 2026-04-25T13:45:00Z
const DATABASE_URL = process.env.DATABASE_URL!;

function createPrismaClient() {
  const maskedUrl = DATABASE_URL.replace(/:[^:@]+@/, ":****@");
  console.log(`[Prisma] Initializing with Neon adapter. URL: ${maskedUrl}`);

  const adapter = new PrismaNeon({ connectionString: DATABASE_URL });
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
