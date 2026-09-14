import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Prisma 7 requires a driver adapter for every provider — see prisma.config.ts
// for the same setup on the CLI (migrate/seed) side. Unlike that file, the
// running app has no sensible fallback: DATABASE_URL must be a real MySQL
// connection string set in the environment (see README's Hostinger notes).
function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your environment before starting the app (see .env.example)."
    );
  }
  const adapter = new PrismaMariaDb(connectionString);
  return new PrismaClient({ adapter });
}

// Reuse a single client across hot-reloads in dev; a fresh one in
// production (each server instance gets its own).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
