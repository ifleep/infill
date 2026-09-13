import type { Category } from "@/lib/types";

export const categories: Category[] = [
  { id: "printers", slug: "3d-printers", name: "3D Printers" },
  { id: "printers-fdm", slug: "fdm", name: "FDM / FFF", parent: "printers" },
  { id: "printers-resin", slug: "resin", name: "Resin", parent: "printers" },
  { id: "printers-corexy", slug: "corexy", name: "CoreXY", parent: "printers" },
  { id: "printers-large", slug: "large-format", name: "Large Format", parent: "printers" },
  { id: "printers-industrial", slug: "industrial", name: "Industrial", parent: "printers" },
  { id: "printers-edu", slug: "educational", name: "Educational", parent: "printers" },
  { id: "printers-diy", slug: "diy", name: "DIY", parent: "printers" },

  { id: "filament", slug: "filament", name: "Filament" },
  { id: "resin-material", slug: "resin-material", name: "Resin" },

  { id: "parts", slug: "parts-accessories", name: "Parts & Accessories" },
  { id: "parts-nozzles", slug: "nozzles", name: "Nozzles", parent: "parts" },
  { id: "parts-hotends", slug: "hotends", name: "Hotends", parent: "parts" },
  { id: "parts-buildplates", slug: "build-plates", name: "Build Plates", parent: "parts" },
  { id: "parts-extruders", slug: "extruders", name: "Extruders", parent: "parts" },

  { id: "machines", slug: "machines", name: "Machines" },
  { id: "machines-cnc", slug: "cnc", name: "CNC", parent: "machines" },
  { id: "machines-uv", slug: "uv-printing", name: "UV Printing", parent: "machines" },
  { id: "machines-laser", slug: "laser", name: "Laser", parent: "machines" },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
