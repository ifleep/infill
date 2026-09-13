import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";
import { seedProducts } from "./seed-data";
import { seedProductToRow } from "../src/lib/seed-shared";

const rawUrl = process.env.DATABASE_URL ?? "file:./data/app.db";
const absoluteUrl = `file:${path.resolve(process.cwd(), rawUrl.replace(/^file:/, ""))}`;
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: absoluteUrl }) });

async function main() {
  console.log(`Seeding ${seedProducts.length} products...`);
  for (const p of seedProducts) {
    const row = seedProductToRow(p);
    await prisma.product.upsert({
      where: { id: row.id },
      create: row,
      update: row,
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
