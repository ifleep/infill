import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export interface ShippingRate {
  city: string;
  cost: number;
  etaDays?: number;
}

// A small key-value store for global site settings that don't warrant
// their own model (SiteSetting.value is a Json column).
export interface SiteSettings {
  whatsappNumber: string;
  whatsappMessage: string;
  /** Per-city flat rates shown at checkout; defaultShippingCost covers any city not listed. */
  shippingRates: ShippingRate[];
  defaultShippingCost: number;
  storeNotificationEmail: string;
}

const DEFAULTS: SiteSettings = {
  whatsappNumber: "923000000000",
  whatsappMessage: "Hi INFiLLPK, I have a question about ",
  shippingRates: [
    { city: "Karachi", cost: 300, etaDays: 2 },
    { city: "Lahore", cost: 300, etaDays: 2 },
    { city: "Islamabad", cost: 300, etaDays: 3 },
    { city: "Rawalpindi", cost: 300, etaDays: 3 },
    { city: "Faisalabad", cost: 350, etaDays: 3 },
  ],
  defaultShippingCost: 450,
  storeNotificationEmail: "",
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

// Looked up at checkout — case-insensitive match against the configured
// city list, falling back to the flat default rate for anywhere else.
export function shippingCostForCity(settings: SiteSettings, city: string): number {
  const match = settings.shippingRates.find((r) => r.city.toLowerCase() === city.trim().toLowerCase());
  return match?.cost ?? settings.defaultShippingCost;
}
