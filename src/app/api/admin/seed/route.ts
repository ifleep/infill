import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { seedProductToRow, seedArticleToRow } from "@/lib/seed-shared";
import { seedProducts } from "../../../../../prisma/seed-data";
import { seedArticles } from "../../../../../prisma/seed-articles-data";
import { brands } from "@/lib/data/brands";
import { revalidateSite } from "@/lib/revalidate";
import type { Prisma } from "@/generated/prisma/client";

// For hosts that give no shell/SSH access (so `npm run db:seed` can never be
// run directly) — lets an already-logged-in admin load the demo catalog with
// a button click instead. Safe to call more than once: upserts by id, same
// as the CLI seed script.
export async function POST() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Product.brandId is a foreign key into Brand — seed these first.
  for (const b of brands) {
    await prisma.brand.upsert({
      where: { id: b.id },
      create: { id: b.id, name: b.name, slug: b.slug, country: b.country, description: b.description },
      update: { name: b.name, slug: b.slug, country: b.country, description: b.description },
    });
  }

  let count = 0;
  for (const p of seedProducts) {
    const row = seedProductToRow(p);
    await prisma.product.upsert({
      where: { id: row.id },
      create: row,
      update: row,
    });
    count++;
  }

  for (const a of seedArticles) {
    const row = seedArticleToRow(a);
    const contentBlocks = row.contentBlocks as unknown as Prisma.InputJsonValue;
    await prisma.article.upsert({
      where: { slug: row.slug },
      create: { ...row, contentBlocks },
      update: { ...row, contentBlocks },
    });
  }

  revalidateSite();
  return NextResponse.json({ seeded: count });
}
