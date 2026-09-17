import { prisma } from "@/lib/db";
import type { Brand } from "@/lib/types";

// The live, admin-editable Brand table — src/lib/data/brands.ts is a
// static list used only to seed this table on a fresh install (see
// prisma/seed.ts and /api/admin/seed); every runtime read/write of brand
// data (the storefront's product cards/filters/search via Product.brandName
// — see products.ts's `fromRow` — and this admin CRUD) goes through here.

export async function getAllBrandsAdmin(): Promise<(Brand & { logoUrl: string | null; productCount: number })[]> {
  const rows = await prisma.brand.findMany({
    include: { logo: true, _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    country: r.country ?? "",
    description: r.description ?? "",
    logoUrl: r.logo?.url ?? null,
    productCount: r._count.products,
  }));
}

export async function getBrandOptions(): Promise<{ id: string; name: string }[]> {
  return prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
}

export async function getBrandAdminById(id: string) {
  return prisma.brand.findUnique({ where: { id }, include: { logo: true } });
}

export interface BrandInput {
  name: string;
  slug: string;
  country: string | null;
  description: string | null;
  logoMediaId: string | null;
}

export async function createBrand(input: BrandInput) {
  return prisma.brand.create({ data: input });
}

export async function updateBrand(id: string, input: BrandInput) {
  return prisma.brand.update({ where: { id }, data: input });
}

export async function deleteBrand(id: string) {
  await prisma.brand.delete({ where: { id } });
}
