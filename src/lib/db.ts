import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Statically scoped (not derived from an env var at runtime) so Next's
// build tracing can see exactly what's accessed, instead of pulling the
// whole project into the server output. Keep the database file at
// data/app.db — see .env.example / README for the deployment note on
// this path needing to persist across restarts.
const dataDir = path.join(process.cwd(), "data");
const absoluteUrl = `file:${path.join(dataDir, "app.db")}`;

function createClient() {
  // data/ is gitignored (it holds the SQLite file), so a fresh checkout or
  // upload never has it — better-sqlite3 errors with "Cannot open database
  // because the directory does not exist" if this isn't created first,
  // which previously surfaced as a `next build` failure (generateStaticParams
  // for /products/[slug] connects to the DB at build time, before any
  // deploy script had a chance to run `prisma migrate deploy`).
  fs.mkdirSync(dataDir, { recursive: true });
  const adapter = new PrismaBetterSqlite3({ url: absoluteUrl });
  return new PrismaClient({ adapter });
}

// Reuse a single client across hot-reloads in dev; a fresh one in
// production (each server instance gets its own).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
