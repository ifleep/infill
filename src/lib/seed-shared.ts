import type { Product } from "@/lib/types";

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
    experienceLevel: JSON.stringify(p.experienceLevel ?? []),
    useCases: JSON.stringify(p.useCases ?? []),
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    currency: p.currency,
    stock: p.stock,
    availability: (p.stock > 0 ? "in-stock" : "out-of-stock") as string,
    quoteOnly: p.quoteOnly ?? false,
    images: JSON.stringify(p.images ?? []),
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
    accessoryIds: p.accessoryIds ? JSON.stringify(p.accessoryIds) : null,
    relatedProductIds: p.relatedProductIds ? JSON.stringify(p.relatedProductIds) : null,
    compatibleFilamentTags: p.compatibleFilamentTags ? JSON.stringify(p.compatibleFilamentTags) : null,
    tags: JSON.stringify(p.tags ?? []),
    rating: p.rating ?? null,
    reviewCount: p.reviewCount ?? null,
    featured: p.featured ?? false,
  };
}
