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
// a button click instead. Safe to call more than once: create-only, so it
// only fills in whatever's still missing (see the comment below on why this
// isn't an upsert).
export async function POST() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create-only, never update: once a demo row exists it may have been
  // customized into a real listing (renamed, repriced, rewritten — see the
  // Bambu Lab A1 CN-variant listing this was built to protect), and this
  // button re-running later must not silently overwrite that. Matches by
  // the same id/slug the CLI seed script (prisma/seed.ts) uses, so a
  // partially-seeded catalog just fills in whatever's still missing.

  // Product.brandId is a foreign key into Brand — seed these first.
  for (const b of brands) {
    const exists = await prisma.brand.findUnique({ where: { id: b.id }, select: { id: true } });
    if (exists) continue;
    await prisma.brand.create({
      data: { id: b.id, name: b.name, slug: b.slug, country: b.country, description: b.description },
    });
  }

  let count = 0;
  for (const p of seedProducts) {
    const row = seedProductToRow(p);
    const exists = await prisma.product.findUnique({ where: { id: row.id }, select: { id: true } });
    if (exists) continue;
    await prisma.product.create({ data: row });
    count++;
  }

  for (const a of seedArticles) {
    const row = seedArticleToRow(a);
    const exists = await prisma.article.findUnique({ where: { slug: row.slug }, select: { slug: true } });
    if (exists) continue;
    const contentBlocks = row.contentBlocks as unknown as Prisma.InputJsonValue;
    await prisma.article.create({ data: { ...row, contentBlocks } });
  }

  revalidateSite();
  return NextResponse.json({ seeded: count });
}
