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
  // connectionLimit is capped explicitly rather than left at the mariadb
  // driver's default (10) — each server/build-worker process gets its own
  // pool, so an uncapped default multiplies fast against a shared MySQL
  // plan's connection limit. Paired with next.config.ts's experimental.cpus
  // cap during build; this also covers the running production server.
  // The mariadb driver reads connection options straight out of the URI's
  // query string, so this is appended rather than parsing the string apart.
  const pooledConnectionString =
    connectionString + (connectionString.includes("?") ? "&" : "?") + "connectionLimit=5";
  const adapter = new PrismaMariaDb(pooledConnectionString);
  return new PrismaClient({ adapter });
}

// Reuse a single client across hot-reloads in dev; a fresh one in
// production (each server instance gets its own).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
