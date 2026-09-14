import type { Product } from "@/lib/types";
import { newBlockId } from "@/lib/content-blocks/types";
import type { seedArticles } from "../../prisma/seed-articles-data";

type SeedArticle = (typeof seedArticles)[number];

// Shared between prisma/seed.ts (CLI, `npm run db:seed`) and the /admin
// "Seed Demo Catalog" action (src/app/api/admin/seed/route.ts) — hosts that
// don't give shell/SSH access (so the CLI script can never be run) still
// need a way to load the demo catalog, hence the admin-triggered version.
export function seedProductToRow(p: Omit<Product, "availability">) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brandId: p.brandId,
    category: p.category,
    subcategory: p.subcategory,
    machineCategory: p.machineCategory ?? null,
    technology: p.technology ?? null,
    // experienceLevel/useCases/accessoryIds/relatedProductIds/
    // compatibleFilamentTags/tags are native Prisma Json columns — pass the
    // arrays directly, no JSON.stringify (unlike specifications/materials
    // below, which are still plain Text columns holding JSON strings).
    experienceLevel: p.experienceLevel ?? [],
    useCases: p.useCases ?? [],
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    currency: p.currency,
    stock: p.stock,
    availability: (p.stock > 0 ? "in-stock" : "out-of-stock") as string,
    quoteOnly: p.quoteOnly ?? false,
    // p.images (demo placeholder strings, not real files) intentionally
    // dropped — the product photo gallery now lives in ProductMedia/Media,
    // seeded separately (or left empty, falling back to the icon visual).
    shortDescription: p.shortDescription,
    description: p.description,
    specifications: JSON.stringify(p.specifications ?? []),
    materials: p.materials ? JSON.stringify(p.materials) : null,
    buildVolumeX: p.buildVolume?.x ?? null,
    buildVolumeY: p.buildVolume?.y ?? null,
    buildVolumeZ: p.buildVolume?.z ?? null,
    speedMmPerSec: p.speedMmPerSec ?? null,
    weightKg: p.weightKg ?? null,
    dimWidth: p.dimensions?.width ?? null,
    dimDepth: p.dimensions?.depth ?? null,
    dimHeight: p.dimensions?.height ?? null,
    warrantyMonths: p.warrantyMonths,
    // Prisma's Json input type doesn't accept a plain `null` (only
    // `Prisma.JsonNull`/`Prisma.DbNull`) — `undefined` (field omitted) is
    // what actually maps to a SQL NULL for an optional Json column here.
    accessoryIds: p.accessoryIds ?? undefined,
    relatedProductIds: p.relatedProductIds ?? undefined,
    compatibleFilamentTags: p.compatibleFilamentTags ?? undefined,
    tags: p.tags ?? [],
    rating: p.rating ?? null,
    reviewCount: p.reviewCount ?? null,
    featured: p.featured ?? false,
  };
}

export function seedArticleToRow(a: SeedArticle) {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    readingMinutes: a.readingMinutes,
    publishedAt: new Date(a.publishedAt),
    status: "published",
    contentBlocks: a.paragraphs.map((html) => ({ id: newBlockId(), type: "richText" as const, html: `<p>${html}</p>` })),
  };
}
