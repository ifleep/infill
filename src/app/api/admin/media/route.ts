import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

const PAGE_SIZE = 60;

export async function GET(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const where = q
    ? {
        OR: [
          { filename: { contains: q } },
          { alt: { contains: q } },
          { caption: { contains: q } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.media.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize: PAGE_SIZE });
}
