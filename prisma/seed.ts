import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { seedProducts } from "./seed-data";
import { seedArticles } from "./seed-articles-data";
import { seedProductToRow, seedArticleToRow } from "../src/lib/seed-shared";
import { brands } from "../src/lib/data/brands";
import type { Prisma } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to your environment before seeding (see .env.example).");
}
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(connectionString) });

async function main() {
  // Create-only, never update: a demo row may have since been customized
  // into a real listing (renamed, repriced, rewritten), and re-running this
  // script must not silently overwrite that — same reasoning as the
  // admin-triggered version (src/app/api/admin/seed/route.ts).

  // Product.brandId is a foreign key into Brand — these ids must exist
  // first, or every product create below fails with a constraint error.
  console.log(`Seeding ${brands.length} brands...`);
  for (const b of brands) {
    const exists = await prisma.brand.findUnique({ where: { id: b.id }, select: { id: true } });
    if (exists) continue;
    await prisma.brand.create({
      data: { id: b.id, name: b.name, slug: b.slug, country: b.country, description: b.description },
    });
  }

  console.log(`Seeding ${seedProducts.length} products...`);
  for (const p of seedProducts) {
    const row = seedProductToRow(p);
    const exists = await prisma.product.findUnique({ where: { id: row.id }, select: { id: true } });
    if (exists) continue;
    await prisma.product.create({ data: row });
  }

  console.log(`Seeding ${seedArticles.length} articles...`);
  for (const a of seedArticles) {
    const row = seedArticleToRow(a);
    const exists = await prisma.article.findUnique({ where: { slug: row.slug }, select: { slug: true } });
    if (exists) continue;
    const contentBlocks = row.contentBlocks as unknown as Prisma.InputJsonValue;
    await prisma.article.create({ data: { ...row, contentBlocks } });
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
