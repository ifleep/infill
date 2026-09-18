import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { duplicateProduct } from "@/lib/data/products";
import { revalidateSite } from "@/lib/revalidate";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const product = await duplicateProduct(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  revalidateSite();
  return NextResponse.json(product);
}
