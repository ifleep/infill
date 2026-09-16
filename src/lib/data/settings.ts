import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { BlockImageRef } from "@/lib/content-blocks/types";
import type { PrintMaterial } from "@/lib/print-estimate";

// A small key-value store for global site settings that don't warrant
// their own model (SiteSetting.value is a Json column).
export interface SiteSettings {
  whatsappNumber: string;
  whatsappMessage: string;
  storeNotificationEmail: string;
  /** Homepage hero photo carousel — admin-selected/reordered, dot navigation. */
  heroImages: BlockImageRef[];
  /** Small fixed-size review-video card on the homepage — hidden entirely when unset. */
  reviewVideoUrl: string;
  reviewVideoCaption: string;
  /** Materials offered on the print price calculator, with their price/kg. */
  printMaterials: PrintMaterial[];
  /** Flat % added to material weight for support structures (the estimator can't know real overhangs without a real slicer — see print-estimate.ts). */
  printSupportOverheadPercent: number;
  /** Flat handling/labor fee added on top of material cost. */
  printServiceFeePkr: number;
}

// Real physical densities (g/cm³) — safe defaults, these are material
// science facts. pricePerKgPkr values are NOT real prices — an admin must
// set these in Settings before the calculator quotes real customers.
const DEFAULT_PRINT_MATERIALS: PrintMaterial[] = [
  { name: "PLA", densityGCm3: 1.24, pricePerKgPkr: 3000 },
  { name: "ABS", densityGCm3: 1.04, pricePerKgPkr: 3200 },
  { name: "PETG", densityGCm3: 1.27, pricePerKgPkr: 3500 },
  { name: "TPU", densityGCm3: 1.21, pricePerKgPkr: 4500 },
];

const DEFAULTS: SiteSettings = {
  whatsappNumber: "8616621610013",
  whatsappMessage: "Hi INFiLLPK, I have a question about ",
  storeNotificationEmail: "sales@infillpk.com",
  heroImages: [],
  reviewVideoUrl: "",
  reviewVideoCaption: "",
  printMaterials: DEFAULT_PRINT_MATERIALS,
  printSupportOverheadPercent: 15,
  printServiceFeePkr: 200,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: Object.keys(DEFAULTS) } },
  });
  const overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULTS, ...overrides } as SiteSettings;
}

export async function updateSiteSettings(patch: Partial<SiteSettings>): Promise<void> {
  await prisma.$transaction(
    Object.entries(patch).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: value as unknown as Prisma.InputJsonValue },
        update: { value: value as unknown as Prisma.InputJsonValue },
      })
    )
  );
}
