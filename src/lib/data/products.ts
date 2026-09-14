import { prisma } from "@/lib/db";
import type { Product } from "@/lib/types";
import type {
  Product as ProductRow,
  ProductMedia as ProductMediaRow,
  Media as MediaRow,
  Prisma,
} from "@/generated/prisma/client";

// Demo catalog — real brand names and real publicly-listed specifications,
// now backed by a real MySQL database (see prisma/schema.prisma) instead
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

// Prisma's native Json columns come back already-parsed — this just narrows
// the resulting `unknown`/JsonValue down to a string[] safely.
function jsonStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

const productWithMediaInclude = {
  media: {
    orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
    include: { media: true },
  },
} satisfies Prisma.ProductInclude;

type ProductWithMedia = ProductRow & {
  media: (ProductMediaRow & { media: MediaRow })[];
};

function fromRow(row: ProductWithMedia): Product {
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
    experienceLevel: jsonStringArray(row.experienceLevel) as Product["experienceLevel"],
    useCases: jsonStringArray(row.useCases) as Product["useCases"],
    price: row.price,
    compareAtPrice: row.compareAtPrice ?? undefined,
    currency: "PKR",
    stock: row.stock,
    availability: row.availability as Product["availability"],
    quoteOnly: row.quoteOnly,
    images: row.media.map((pm) => pm.media.url),
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
    accessoryIds: row.accessoryIds ? jsonStringArray(row.accessoryIds) : undefined,
    relatedProductIds: row.relatedProductIds ? jsonStringArray(row.relatedProductIds) : undefined,
    compatibleFilamentTags: row.compatibleFilamentTags ? jsonStringArray(row.compatibleFilamentTags) : undefined,
    tags: jsonStringArray(row.tags),
    rating: row.rating ?? undefined,
    reviewCount: row.reviewCount ?? undefined,
    featured: row.featured,
  };
}

// ---------------------------------------------------------------- Public reads

export async function getAllProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ orderBy: { name: "asc" }, include: productWithMediaInclude });
  return rows.map(fromRow);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({ where: { slug }, include: productWithMediaInclude });
  return row ? fromRow(row) : null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({ where: { id }, include: productWithMediaInclude });
  return row ? fromRow(row) : null;
}

export async function getProductsByCategory(category: Product["category"]): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { category },
    orderBy: { name: "asc" },
    include: productWithMediaInclude,
  });
  return rows.map(fromRow);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { featured: true },
    orderBy: { name: "asc" },
    include: productWithMediaInclude,
  });
  return rows.map(fromRow);
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const ids = product.relatedProductIds ?? [];
  if (ids.length === 0) return [];
  const rows = await prisma.product.findMany({ where: { id: { in: ids } }, include: productWithMediaInclude });
  return rows.map(fromRow);
}

export async function getAccessories(product: Product): Promise<Product[]> {
  const ids = product.accessoryIds ?? [];
  if (ids.length === 0) return [];
  const rows = await prisma.product.findMany({ where: { id: { in: ids } }, include: productWithMediaInclude });
  return rows.map(fromRow);
}

export async function getCompatibleFilaments(product: Product): Promise<Product[]> {
  const tags = product.compatibleFilamentTags ?? [];
  if (tags.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: { category: { in: ["filament", "resin"] } },
    include: productWithMediaInclude,
  });
  return rows.map(fromRow).filter((p) => p.tags.some((t) => tags.includes(t)));
}

// ---------------------------------------------------------------- Admin writes
//
// Used only by /admin pages and /api/admin/* route handlers, all of which
// sit behind requireAdminSession() (see src/lib/admin-auth.ts).

export interface ProductMediaItem {
  /** Media Library id — this is what gets saved back as ProductInput.mediaIds. */
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
}

// The photo grid a product owns, for prefilling the admin edit form (the
// public Product type only exposes flattened `images: string[]`, which
// isn't enough to resubmit — we need the underlying Media ids).
export async function getProductAdminById(
  id: string
): Promise<(Product & { mediaItems: ProductMediaItem[] }) | null> {
  const row = await prisma.product.findUnique({ where: { id }, include: productWithMediaInclude });
  if (!row) return null;
  return {
    ...fromRow(row),
    mediaItems: row.media.map((pm) => ({
      id: pm.mediaId,
      url: pm.media.url,
      alt: pm.alt ?? pm.media.alt,
      caption: pm.caption ?? pm.media.caption,
    })),
  };
}

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
  /**
   * Ordered Media Library ids — the first becomes the primary photo.
   * `undefined` means "leave the product's existing photos alone" (the
   * dashboard's inline quick-edit row only ever patches price/stock/etc.
   * and never sends this field, so it must not be treated as "clear
   * photos"). Pass `[]` explicitly to remove all photos.
   */
  mediaIds?: string[];
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

function mediaCreateInput(mediaIds: string[]) {
  return mediaIds.map((mediaId, i) => ({
    mediaId,
    position: i,
    isPrimary: i === 0,
  }));
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const row = await prisma.product.create({
    data: {
      id: `p-${input.slug}`,
      ...toDbInput(input),
      experienceLevel: [],
      useCases: [],
      currency: "PKR",
      specifications: "[]",
      tags: [],
      warrantyMonths: 12,
      media: { create: mediaCreateInput(input.mediaIds ?? []) },
    },
    include: productWithMediaInclude,
  });
  return fromRow(row);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const row = await prisma.$transaction(async (tx) => {
    if (input.mediaIds !== undefined) {
      await tx.productMedia.deleteMany({ where: { productId: id } });
    }
    return tx.product.update({
      where: { id },
      data: {
        ...toDbInput(input),
        ...(input.mediaIds !== undefined ? { media: { create: mediaCreateInput(input.mediaIds) } } : {}),
      },
      include: productWithMediaInclude,
    });
  });
  return fromRow(row);
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}
