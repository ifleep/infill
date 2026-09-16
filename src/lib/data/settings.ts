import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { BlockImageRef } from "@/lib/content-blocks/types";

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
}

const DEFAULTS: SiteSettings = {
  whatsappNumber: "8616621610013",
  whatsappMessage: "Hi INFiLLPK, I have a question about ",
  storeNotificationEmail: "sales@infillpk.com",
  heroImages: [],
  reviewVideoUrl: "",
  reviewVideoCaption: "",
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
