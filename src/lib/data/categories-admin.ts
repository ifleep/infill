import { prisma } from "@/lib/db";

// The admin-managed Category taxonomy (parent/child, assignable to
// products) — distinct from src/lib/data/categories.ts, an older static
// list that nothing in the app actually reads, and from Product.category,
// the fixed 5-value string that drives the storefront's actual shop
// sections/routing. This is a separate, purely organizational tree.

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parentName: string | null;
  productCount: number;
  childCount: number;
}

export async function getAllCategoriesAdmin(): Promise<AdminCategory[]> {
  const rows = await prisma.category.findMany({
    include: { parent: true, _count: { select: { products: true, children: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    parentId: r.parentId,
    parentName: r.parent?.name ?? null,
    productCount: r._count.products,
    childCount: r._count.children,
  }));
}

export async function getCategoryOptions(): Promise<{ id: string; name: string }[]> {
  return prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
}

export async function getCategoryAdminById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export interface CategoryInput {
  name: string;
  slug: string;
  parentId: string | null;
}

/** True if `candidateParentId` is `categoryId` itself or a descendant of it — assigning it as the parent would create a cycle. */
export async function wouldCreateCycle(categoryId: string, candidateParentId: string): Promise<boolean> {
  let current: string | null = candidateParentId;
  while (current) {
    if (current === categoryId) return true;
    const row: { parentId: string | null } | null = await prisma.category.findUnique({
      where: { id: current },
      select: { parentId: true },
    });
    current = row?.parentId ?? null;
  }
  return false;
}

export async function createCategory(input: CategoryInput) {
  return prisma.category.create({ data: input });
}

export async function updateCategory(id: string, input: CategoryInput) {
  return prisma.category.update({ where: { id }, data: input });
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
}
