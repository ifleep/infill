import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 requires a driver adapter for every provider (no more `url` in
// schema.prisma — see the error this used to throw before this file was
// updated) — but that adapter is only a runtime (PrismaClient) concept, see
// src/lib/db.ts. This config file is CLI-only (migrate/seed/introspect),
// which connects with a plain connection string via `datasource.url`
// instead. DATABASE_URL still falls back to a fixed local default so
// `prisma migrate deploy`/`db seed` keep working out of the box on hosts
// where a configured env var isn't guaranteed to reach the terminal/SSH
// session a build command runs in (see README's Hostinger notes) — set a
// real DATABASE_URL for anything other than local development.
const connectionString =
  process.env["DATABASE_URL"] ?? "mysql://root@127.0.0.1:3306/infillpk";

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
