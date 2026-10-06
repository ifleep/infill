import { unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { getUsedMediaRefs, isMediaUnused } from "@/lib/data/media-usage";

// Deletes every Media row this moment finds unused — recomputes usage
// itself rather than trusting a list of ids from the client, so a file
// that got referenced somewhere between the admin loading the page and
// clicking the button is never deleted out from under it.
export async function POST() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [all, used] = await Promise.all([
    prisma.media.findMany({ select: { id: true, url: true } }),
    getUsedMediaRefs(),
  ]);
  const unused = all.filter((m) => isMediaUnused(m, used));

  if (unused.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  await prisma.media.deleteMany({ where: { id: { in: unused.map((m) => m.id) } } });

  // Best-effort — an already-missing file shouldn't fail the API call.
  await Promise.all(
    unused
      .filter((m) => m.url.startsWith("/uploads/"))
      .map((m) => {
        const filePath = path.join(process.cwd(), "public", "uploads", m.url.slice("/uploads/".length));
        return unlink(filePath).catch(() => {});
      })
  );

  revalidateSite();
  return NextResponse.json({ deleted: unused.length });
}
