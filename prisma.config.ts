import "dotenv/config";
import { defineConfig } from "prisma/config";

// Falls back to the same fixed path src/lib/db.ts uses at runtime, so
// `prisma migrate deploy`/`db seed` work out of the box on hosts (like
// Hostinger's Node.js App Manager) where configured environment variables
// aren't necessarily exported into the terminal/SSH session a build command
// runs in — only DATABASE_URL is actually optional in practice here, since
// the running app never reads it (it connects straight to data/app.db
// itself). Still overridable via a real DATABASE_URL env var or .env file,
// which you'd do when migrating to MySQL (see README.md).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"] || "file:./data/app.db",
  },
});
