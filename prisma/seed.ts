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
  // Product.brandId is a foreign key into Brand — these ids must exist
  // first, or every product upsert below fails with a constraint error.
  console.log(`Seeding ${brands.length} brands...`);
  for (const b of brands) {
    await prisma.brand.upsert({
      where: { id: b.id },
      create: { id: b.id, name: b.name, slug: b.slug, country: b.country, description: b.description },
      update: { name: b.name, slug: b.slug, country: b.country, description: b.description },
    });
  }

  console.log(`Seeding ${seedProducts.length} products...`);
  for (const p of seedProducts) {
    const row = seedProductToRow(p);
    await prisma.product.upsert({
      where: { id: row.id },
      create: row,
      update: row,
    });
  }

  console.log(`Seeding ${seedArticles.length} articles...`);
  for (const a of seedArticles) {
    const row = seedArticleToRow(a);
    const contentBlocks = row.contentBlocks as unknown as Prisma.InputJsonValue;
    await prisma.article.upsert({
      where: { slug: row.slug },
      create: { ...row, contentBlocks },
      update: { ...row, contentBlocks },
    });
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
