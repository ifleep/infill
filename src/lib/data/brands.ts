import type { Brand } from "@/lib/types";

// Demo seed data only — used by prisma/seed.ts and /api/admin/seed to
// populate the real Brand database table on a fresh install. Once seeded,
// every runtime read/write goes through the database instead (see
// src/lib/data/brands-admin.ts for the admin CRUD, and Product.brandName/
// brandSlug — set in products.ts's `fromRow` — for how the storefront
// gets brand info without importing this file).
export const brands: Brand[] = [
  { id: "bambulab", name: "Bambu Lab", slug: "bambu-lab", country: "China", description: "High-speed CoreXY printers with automated color systems." },
  { id: "creality", name: "Creality", slug: "creality", country: "China", description: "The world's most widely adopted entry-to-mid FDM printer maker." },
  { id: "elegoo", name: "Elegoo", slug: "elegoo", country: "China", description: "Resin and FDM printers focused on value and detail resolution." },
  { id: "anycubic", name: "Anycubic", slug: "anycubic", country: "China", description: "FDM and MSLA resin printers for hobbyists and small studios." },
  { id: "prusa", name: "Prusa Research", slug: "prusa-research", country: "Czech Republic", description: "Open-source engineering heritage and renowned reliability." },
  { id: "snapmaker", name: "Snapmaker", slug: "snapmaker", country: "China", description: "Modular and large-format machines for makers and small manufacturers." },
  { id: "raise3d", name: "Raise3D", slug: "raise3d", country: "China", description: "Professional and industrial-grade FDM systems." },
  { id: "formlabs", name: "Formlabs", slug: "formlabs", country: "United States", description: "Professional stereolithography (SLA) for engineering and dental." },
  { id: "polymaker", name: "Polymaker", slug: "polymaker", country: "China", description: "Engineering-grade and specialty filaments." },
  { id: "esun", name: "eSUN", slug: "esun", country: "China", description: "High-volume, widely available filament manufacturer." },
  { id: "overture", name: "Overture", slug: "overture", country: "China", description: "Consistent, well-reviewed consumer filament." },
  { id: "sirayatech", name: "Siraya Tech", slug: "siraya-tech", country: "China", description: "Specialty and engineering resins." },
  { id: "e3d", name: "E3D", slug: "e3d", country: "United Kingdom", description: "Precision hotends and extrusion components." },
  { id: "micro-swiss", name: "Micro Swiss", slug: "micro-swiss", country: "United States", description: "All-metal hotends and wear-resistant nozzles." },
  { id: "bondtech", name: "Bondtech", slug: "bondtech", country: "Sweden", description: "High-precision extruders." },
  { id: "xtool", name: "xTool", slug: "xtool", country: "China", description: "Desktop laser cutting and engraving systems." },
  { id: "carvera", name: "Makera", slug: "makera", country: "China", description: "Desktop CNC machining centers." },
  { id: "roland", name: "Roland DG", slug: "roland-dg", country: "Japan", description: "Professional UV flatbed and wide-format printing." },
];
