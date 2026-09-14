import { prisma } from "@/lib/db";
import type { Product } from "@/lib/types";
import type { Product as ProductRow } from "@/generated/prisma/client";

// Demo catalog — real brand names and real publicly-listed specifications,
// now backed by a real SQLite database (see prisma/schema.prisma) instead
// of a static file, so it can be edited from /admin. Pricing is an
// estimated PKR figure for demonstration only (confirmed at checkout in a
// real store) and does not represent a confirmed distributor relationship.

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function fromRow(row: ProductRow): Product {
  const hasBuildVolume = row.buildVolumeX != null && row.buildVolumeY != null && row.buildVolumeZ != null;
  const hasDimensions = row.dimWidth != null && row.dimDepth != null && row.dimHeight != null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brandId: row.brandId,
    category: row.category as Product["category"],
    subcategory: row.subcategory,
    machineCategory: (row.machineCategory as Product["machineCategory"]) ?? undefined,
    technology: (row.technology as Product["technology"]) ?? undefined,
    experienceLevel: parseJson(row.experienceLevel, []),
    useCases: parseJson(row.useCases, []),
    price: row.price,
    compareAtPrice: row.compareAtPrice ?? undefined,
    currency: "PKR",
    stock: row.stock,
    availability: row.availability as Product["availability"],
    quoteOnly: row.quoteOnly,
    images: parseJson(row.images, []),
    shortDescription: row.shortDescription,
    description: row.description,
    specifications: parseJson(row.specifications, []),
    materials: row.materials ? parseJson(row.materials, []) : undefined,
    buildVolume: hasBuildVolume
      ? { x: row.buildVolumeX!, y: row.buildVolumeY!, z: row.buildVolumeZ!, unit: "mm" }
      : undefined,
    speedMmPerSec: row.speedMmPerSec ?? undefined,
    weightKg: row.weightKg ?? undefined,
    dimensions: hasDimensions
      ? { width: row.dimWidth!, depth: row.dimDepth!, height: row.dimHeight!, unit: "mm" }
      : undefined,
    warrantyMonths: row.warrantyMonths,
    accessoryIds: row.accessoryIds ? parseJson(row.accessoryIds, []) : undefined,
    relatedProductIds: row.relatedProductIds ? parseJson(row.relatedProductIds, []) : undefined,
    compatibleFilamentTags: row.compatibleFilamentTags ? parseJson(row.compatibleFilamentTags, []) : undefined,
    tags: parseJson(row.tags, []),
    rating: row.rating ?? undefined,
    reviewCount: row.reviewCount ?? undefined,
    featured: row.featured,
  };
}

// ---------------------------------------------------------------- Public reads

export async function getAllProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return rows.map(fromRow);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({ where: { slug } });
  return row ? fromRow(row) : null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({ where: { id } });
  return row ? fromRow(row) : null;
}

export async function getProductsByCategory(category: Product["category"]): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { category }, orderBy: { name: "asc" } });
  return rows.map(fromRow);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { featured: true }, orderBy: { name: "asc" } });
  return rows.map(fromRow);
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const ids = product.relatedProductIds ?? [];
  if (ids.length === 0) return [];
  const rows = await prisma.product.findMany({ where: { id: { in: ids } } });
  return rows.map(fromRow);
}

export async function getAccessories(product: Product): Promise<Product[]> {
  const ids = product.accessoryIds ?? [];
  if (ids.length === 0) return [];
  const rows = await prisma.product.findMany({ where: { id: { in: ids } } });
  return rows.map(fromRow);
}

export async function getCompatibleFilaments(product: Product): Promise<Product[]> {
  const tags = product.compatibleFilamentTags ?? [];
  if (tags.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: { category: { in: ["filament", "resin"] } },
  });
  return rows.map(fromRow).filter((p) => p.tags.some((t) => tags.includes(t)));
}

// ---------------------------------------------------------------- Admin writes
//
// Used only by /admin pages and /api/admin/* route handlers, all of which
// sit behind requireAdminSession() (see src/lib/admin-auth.ts).

export interface ProductInput {
  slug: string;
  name: string;
  brandId: string;
  category: Product["category"];
  subcategory: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  availability: Product["availability"];
  quoteOnly: boolean;
  shortDescription: string;
  description: string;
  featured: boolean;
  images: string[];
}

function toDbInput(input: ProductInput) {
  return {
    slug: input.slug,
    name: input.name,
    brandId: input.brandId,
    category: input.category,
    subcategory: input.subcategory,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    stock: input.stock,
    availability: input.availability,
    quoteOnly: input.quoteOnly,
    shortDescription: input.shortDescription,
    description: input.description,
    featured: input.featured,
    images: JSON.stringify(input.images),
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export { slugify };

export async function createProduct(input: ProductInput): Promise<Product> {
  const row = await prisma.product.create({
    data: {
      id: `p-${input.slug}`,
      ...toDbInput(input),
      experienceLevel: "[]",
      useCases: "[]",
      currency: "PKR",
      specifications: "[]",
      tags: "[]",
      warrantyMonths: 12,
    },
  });
  return fromRow(row);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const row = await prisma.product.update({
    where: { id },
    data: toDbInput(input),
  });
  return fromRow(row);
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}
