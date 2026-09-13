import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";
import { seedProducts } from "./seed-data";
import type { Product } from "../src/lib/types";

const rawUrl = process.env.DATABASE_URL ?? "file:./data/app.db";
const absoluteUrl = `file:${path.resolve(process.cwd(), rawUrl.replace(/^file:/, ""))}`;
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: absoluteUrl }) });

function toRow(p: Omit<Product, "availability">) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brandId: p.brandId,
    category: p.category,
    subcategory: p.subcategory,
    machineCategory: p.machineCategory ?? null,
    technology: p.technology ?? null,
    experienceLevel: JSON.stringify(p.experienceLevel ?? []),
    useCases: JSON.stringify(p.useCases ?? []),
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    currency: p.currency,
    stock: p.stock,
    availability: (p.stock > 0 ? "in-stock" : "out-of-stock") as string,
    quoteOnly: p.quoteOnly ?? false,
    images: JSON.stringify(p.images ?? []),
    shortDescription: p.shortDescription,
    description: p.description,
    specifications: JSON.stringify(p.specifications ?? []),
    materials: p.materials ? JSON.stringify(p.materials) : null,
    buildVolumeX: p.buildVolume?.x ?? null,
    buildVolumeY: p.buildVolume?.y ?? null,
    buildVolumeZ: p.buildVolume?.z ?? null,
    speedMmPerSec: p.speedMmPerSec ?? null,
    weightKg: p.weightKg ?? null,
    dimWidth: p.dimensions?.width ?? null,
    dimDepth: p.dimensions?.depth ?? null,
    dimHeight: p.dimensions?.height ?? null,
    warrantyMonths: p.warrantyMonths,
    accessoryIds: p.accessoryIds ? JSON.stringify(p.accessoryIds) : null,
    relatedProductIds: p.relatedProductIds ? JSON.stringify(p.relatedProductIds) : null,
    compatibleFilamentTags: p.compatibleFilamentTags ? JSON.stringify(p.compatibleFilamentTags) : null,
    tags: JSON.stringify(p.tags ?? []),
    rating: p.rating ?? null,
    reviewCount: p.reviewCount ?? null,
    featured: p.featured ?? false,
  };
}

async function main() {
  console.log(`Seeding ${seedProducts.length} products...`);
  for (const p of seedProducts) {
    const row = toRow(p);
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
