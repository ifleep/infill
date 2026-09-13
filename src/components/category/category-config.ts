import type { ProductCategory } from "@/lib/types";

export interface CategoryDef {
  slug: string;
  title: string;
  description: string;
  productCategory: ProductCategory;
}

export const categoryDefs: CategoryDef[] = [
  {
    slug: "3d-printers",
    title: "3D Printers",
    description: "FDM, resin, CoreXY, large-format, industrial and educational machines.",
    productCategory: "printers",
  },
  {
    slug: "filament",
    title: "Filament",
    description: "PLA, PETG, ABS, ASA, TPU and engineering-grade filaments.",
    productCategory: "filament",
  },
  {
    slug: "resin",
    title: "Resin",
    description: "Standard and engineering resins for MSLA and SLA printing.",
    productCategory: "resin",
  },
  {
    slug: "parts-accessories",
    title: "Parts & Accessories",
    description: "Nozzles, hotends, build plates, extruders and replacement parts.",
    productCategory: "parts",
  },
  {
    slug: "machines",
    title: "Machines",
    description: "CNC, UV printing and laser cutting — the fabrication ecosystem beyond 3D printing.",
    productCategory: "machines",
  },
];

export function getCategoryDef(slug: string) {
  return categoryDefs.find((c) => c.slug === slug);
}
