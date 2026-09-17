import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { updateCategory, deleteCategory, wouldCreateCycle } from "@/lib/data/categories-admin";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { revalidateSite } from "@/lib/revalidate";

function parseInput(body: unknown): { input: { name: string; slug: string; parentId: string | null } } | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return { error: "Name is required." };
  const rawSlug = typeof b.slug === "string" && b.slug.trim() ? b.slug : name;
  const slug = slugify(rawSlug);
  if (!slug) return { error: "Could not generate a URL slug from that name." };
  const parentId = typeof b.parentId === "string" && b.parentId ? b.parentId : null;
  return { input: { name, slug, parentId } };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const result = parseInput(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (result.input.parentId === id) {
    return NextResponse.json({ error: "A category can't be its own parent." }, { status: 400 });
  }
  if (result.input.parentId && (await wouldCreateCycle(id, result.input.parentId))) {
    return NextResponse.json(
      { error: "That would create a loop — a category can't be nested under its own subcategory." },
      { status: 400 }
    );
  }

  if (result.input.slug !== existing.slug) {
    const slugTaken = await prisma.category.findUnique({ where: { slug: result.input.slug } });
    if (slugTaken) {
      return NextResponse.json({ error: `A category with slug "${result.input.slug}" already exists.` }, { status: 409 });
    }
  }

  const category = await updateCategory(id, result.input);
  revalidateSite();
  return NextResponse.json(category);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [childCount, productCount] = await Promise.all([
    prisma.category.count({ where: { parentId: id } }),
    prisma.product.count({ where: { categoryId: id } }),
  ]);
  if (childCount > 0) {
    return NextResponse.json({ error: "Move or delete its subcategories first." }, { status: 409 });
  }
  if (productCount > 0) {
    return NextResponse.json(
      { error: `${productCount} product(s) are assigned to this category — reassign them first.` },
      { status: 409 }
    );
  }

  await deleteCategory(id);
  revalidateSite();
  return NextResponse.json({ ok: true });
}
