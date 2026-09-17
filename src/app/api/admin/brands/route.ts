import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { getAllBrandsAdmin, createBrand, type BrandInput } from "@/lib/data/brands-admin";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { revalidateSite } from "@/lib/revalidate";

function parseInput(body: unknown): { input: BrandInput } | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return { error: "Name is required." };
  const rawSlug = typeof b.slug === "string" && b.slug.trim() ? b.slug : name;
  const slug = slugify(rawSlug);
  if (!slug) return { error: "Could not generate a URL slug from that name." };
  const country = typeof b.country === "string" && b.country.trim() ? b.country.trim() : null;
  const description = typeof b.description === "string" && b.description.trim() ? b.description.trim() : null;
  const logoMediaId = typeof b.logoMediaId === "string" && b.logoMediaId ? b.logoMediaId : null;
  return { input: { name, slug, country, description, logoMediaId } };
}

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const brands = await getAllBrandsAdmin();
  return NextResponse.json(brands);
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
  const existing = await prisma.brand.findUnique({ where: { slug: result.input.slug } });
  if (existing) {
    return NextResponse.json({ error: `A brand with slug "${result.input.slug}" already exists.` }, { status: 409 });
  }
  const brand = await createBrand(result.input);
  revalidateSite();
  return NextResponse.json(brand, { status: 201 });
}
