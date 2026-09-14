import { prisma } from "@/lib/db";

// A small key-value store for global site settings that don't warrant
// their own model (SiteSetting.value is a Json column) — starting with
// just the WhatsApp contact button, since that's the one place a real
// placeholder value was hardcoded in the frontend. More keys can be added
// here later without a migration.
export interface SiteSettings {
  whatsappNumber: string;
  whatsappMessage: string;
}

const DEFAULTS: SiteSettings = {
  whatsappNumber: "923000000000",
  whatsappMessage: "Hi INFiLLPK, I have a question about ",
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
        create: { key, value: value as string },
        update: { value: value as string },
      })
    )
  );
}
