import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { getAllCategoriesAdmin, createCategory } from "@/lib/data/categories-admin";
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

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const categories = await getAllCategoriesAdmin();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const result = parseInput(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const existing = await prisma.category.findUnique({ where: { slug: result.input.slug } });
  if (existing) {
    return NextResponse.json({ error: `A category with slug "${result.input.slug}" already exists.` }, { status: 409 });
  }
  const category = await createCategory(result.input);
  revalidateSite();
  return NextResponse.json(category, { status: 201 });
}
