// Server-only barrel: re-exports the full data layer, including the
// Prisma-backed products module (src/lib/db.ts touches Node's `fs`/native
// bindings via better-sqlite3). Safe to import from Server Components and
// API routes, but NEVER from a "use client" component — doing so pulls the
// whole database client into the browser bundle and breaks the build.
// Client components should import brands/categories/etc. directly from
// their own files (e.g. "@/lib/data/brands") instead.
export * from "@/lib/data/brands";
export * from "@/lib/data/products";
export * from "@/lib/data/categories";
export * from "@/lib/data/articles";
export * from "@/lib/data/services";
export * from "@/lib/data/pakistan-regions";
