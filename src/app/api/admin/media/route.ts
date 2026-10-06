import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getUsedMediaRefs, isMediaUnused } from "@/lib/data/media-usage";

const PAGE_SIZE = 60;

export async function GET(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const unusedOnly = searchParams.get("unused") === "true";

  const where = q
    ? {
        OR: [
          { filename: { contains: q } },
          { alt: { contains: q } },
          { caption: { contains: q } },
        ],
      }
    : {};

  // Always computed, regardless of the current search/filter, so the
  // "Delete unused photos" affordance can show an accurate count without a
  // separate round-trip — see getUsedMediaRefs for what counts as "used".
  const used = await getUsedMediaRefs();

  if (unusedOnly) {
    // "Unused" isn't a DB column, so it can't be filtered/paginated at the
    // SQL level — fetch every row matching the text search, filter in app
    // code, then paginate the filtered result. Fine at this library's
    // scale (an admin housekeeping view, not a high-traffic listing).
    const allMatching = await prisma.media.findMany({ where, orderBy: { createdAt: "desc" } });
    const unused = allMatching.filter((m) => isMediaUnused(m, used));
    const total = unused.length;
    const items = unused.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((m) => ({ ...m, inUse: false }));
    return NextResponse.json({ items, total, page, pageSize: PAGE_SIZE, unusedTotal: total });
  }

  const [rows, total, allIdsAndUrls] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.media.count({ where }),
    // Only id/url needed to classify every row in the library, regardless
    // of the current search — avoids pulling every column twice.
    prisma.media.findMany({ select: { id: true, url: true } }),
  ]);
  const items = rows.map((m) => ({ ...m, inUse: !isMediaUnused(m, used) }));
  const unusedTotal = allIdsAndUrls.filter((m) => isMediaUnused(m, used)).length;

  return NextResponse.json({ items, total, page, pageSize: PAGE_SIZE, unusedTotal });
}
