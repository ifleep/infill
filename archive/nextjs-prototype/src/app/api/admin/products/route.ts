import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { getAllProducts, createProduct } from "@/lib/data/products";
import { validateProductInput } from "@/lib/admin-validate-product";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await getAllProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = validateProductInput(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { slug: result.input.slug } });
  if (existing) {
    return NextResponse.json({ error: `A product with slug "${result.input.slug}" already exists.` }, { status: 409 });
  }

  const product = await createProduct(result.input);
  return NextResponse.json(product, { status: 201 });
}
