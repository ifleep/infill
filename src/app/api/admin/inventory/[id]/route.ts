import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";

// A narrow, stock-focused sibling to /api/admin/products/[id] — that route
// requires the full product shape (validateProductInput), which is
// overkill for the inventory table's inline stock/threshold edits.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const data: { stock?: number; lowStockThreshold?: number | null } = {};

  if ("stock" in b) {
    const stock = Number(b.stock);
    if (!Number.isFinite(stock) || stock < 0) {
      return NextResponse.json({ error: "Stock must be zero or a positive number." }, { status: 400 });
    }
    data.stock = Math.round(stock);
  }

  if ("lowStockThreshold" in b) {
    if (b.lowStockThreshold === null || b.lowStockThreshold === "") {
      data.lowStockThreshold = null;
    } else {
      const threshold = Number(b.lowStockThreshold);
      if (!Number.isFinite(threshold) || threshold < 1) {
        return NextResponse.json({ error: "Low-stock threshold must be a positive number." }, { status: 400 });
      }
      data.lowStockThreshold = Math.round(threshold);
    }
  }

  const product = await prisma.product.update({ where: { id }, data });
  revalidateSite();
  return NextResponse.json({ id: product.id, stock: product.stock, lowStockThreshold: product.lowStockThreshold });
}
