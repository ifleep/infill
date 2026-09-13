import { brands } from "@/lib/data/brands";
import { categories } from "@/lib/data/categories";

export * from "@/lib/data/brands";
export * from "@/lib/data/products";
export * from "@/lib/data/categories";
export * from "@/lib/data/articles";
export * from "@/lib/data/services";
export * from "@/lib/data/pakistan-regions";

export function getBrandById(id: string) {
  return brands.find((b) => b.id === id);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
