import type { ProductCategory, Article } from "@/lib/types";

export interface CategoryDef {
  slug: string;
  title: string;
  description: string;
  productCategory: ProductCategory;
  /** Lab article categories relevant to this product category — drives the "Related guides" links on the category page, the reverse of the product-link section on Lab articles. */
  articleCategories: Article["category"][];
}

export const categoryDefs: CategoryDef[] = [
  {
    slug: "3d-printers",
    title: "3D Printers",
    description: "FDM, resin, CoreXY, large-format, industrial and educational machines.",
    productCategory: "printers",
    articleCategories: ["Buying Guide", "Comparison", "Technology"],
  },
  {
    slug: "filament",
    title: "Filament",
    description: "PLA, PETG, ABS, ASA, TPU and engineering-grade filaments.",
    productCategory: "filament",
    articleCategories: ["Materials"],
  },
  {
    slug: "resin",
    title: "Resin",
    description: "Standard and engineering resins for MSLA and SLA printing.",
    productCategory: "resin",
    articleCategories: ["Materials", "Comparison"],
  },
  {
    slug: "parts-accessories",
    title: "Parts & Accessories",
    description: "Nozzles, hotends, build plates, extruders and replacement parts.",
    productCategory: "parts",
    articleCategories: ["Maintenance"],
  },
  {
    slug: "machines",
    title: "Machines",
    description: "CNC, UV printing, laser cutting and robots — the fabrication ecosystem beyond 3D printing.",
    productCategory: "machines",
    articleCategories: ["Technology"],
  },
];

export function getCategoryDef(slug: string) {
  return categoryDefs.find((c) => c.slug === slug);
}
