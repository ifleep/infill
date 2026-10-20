import { prisma } from "@/lib/db";

export interface PublicBrand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
}

function fromRow(row: { id: string; name: string; slug: string; description: string | null; logo: { url: string } | null }): PublicBrand {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    logoUrl: row.logo?.url ?? null,
  };
}

/** Storefront brand index (/brands) — only brands with at least one visible product. */
export async function getBrandsWithVisibleProducts(): Promise<PublicBrand[]> {
  const rows = await prisma.brand.findMany({
    where: { products: { some: { hidden: false } } },
    include: { logo: true },
    orderBy: { name: "asc" },
  });
  return rows.map(fromRow);
}

export async function getBrandBySlug(slug: string): Promise<PublicBrand | null> {
  const row = await prisma.brand.findUnique({ where: { slug }, include: { logo: true } });
  return row ? fromRow(row) : null;
}
