import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { seedProductToRow } from "@/lib/seed-shared";
import { seedProducts } from "../../../../../prisma/seed-data";

// For hosts that give no shell/SSH access (so `npm run db:seed` can never be
// run directly) — lets an already-logged-in admin load the demo catalog with
// a button click instead. Safe to call more than once: upserts by id, same
// as the CLI seed script.
export async function POST() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  return NextResponse.json({ seeded: count });
}
