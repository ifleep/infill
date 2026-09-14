import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 requires a driver adapter for every provider (no more `url` in
// schema.prisma — see the error this used to throw before this file was
// updated) — but that adapter is only a runtime (PrismaClient) concept, see
// src/lib/db.ts. This config file is CLI-only (migrate/seed/introspect),
// which connects with a plain connection string via `datasource.url`
// instead.
//
// No silent fallback here on purpose: an earlier version of this file fell
// back to a hardcoded `mysql://root@127.0.0.1:3306/infillpk` when
// DATABASE_URL wasn't set, which meant a deploy that forgot to configure
// the env var failed with a confusing "root" authentication error instead
// of a clear "you forgot to set DATABASE_URL" one — set a real
// DATABASE_URL (see .env.example / README) before running any `prisma`
// command.
const connectionString = process.env["DATABASE_URL"];
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to your environment before running Prisma CLI commands (see .env.example)."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: connectionString,
  },
});
