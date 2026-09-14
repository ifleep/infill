import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 requires a driver adapter for every provider (no more `url` in
// schema.prisma — see the error this used to throw before this file was
// updated) — but that adapter is only a runtime (PrismaClient) concept, see
// src/lib/db.ts. This config file is CLI-only (migrate/seed/introspect),
// which connects with a plain connection string via `datasource.url`
// instead.
//
// `prisma generate` (which runs on every `npm install` via the postinstall
// script) only needs the schema — it never opens a database connection —
// so this must NOT throw just because DATABASE_URL isn't set yet at
// install time; an earlier version of this file did throw unconditionally
// here and broke `npm install` on Hostinger before the env var was even
// configurable. `datasource` is omitted entirely when DATABASE_URL is
// unset, so `generate` still succeeds; `migrate`/`db seed`, which do need
// a real connection, fail with Prisma's own clear
// "datasource.url property is required in your Prisma config file"
// message when actually run without one.
//
// (No silent fallback to a hardcoded connection string either — an even
// earlier version defaulted to mysql://root@127.0.0.1:3306/infillpk,
// which turned a missing env var into a confusing MySQL auth error
// instead of pointing at the real problem.)
const connectionString = process.env["DATABASE_URL"];

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  ...(connectionString ? { datasource: { url: connectionString } } : {}),
});
