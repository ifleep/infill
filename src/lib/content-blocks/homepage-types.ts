import type { BlockImageRef } from "@/lib/content-blocks/types";

// Homepage promotional content (requirement #8/9) — explicitly NOT the 3D
// hero, printer finder, or Pakistan map, which stay hand-built custom
// components. This is the "20% off filaments this week" kind of content an
// owner needs to change often without a code change/redeploy. Stored as
// HomepageSection.config (Json) in the DB.

export interface PromoBannerConfig {
  desktopImage: BlockImageRef;
  mobileImage?: BlockImageRef;
  heading: string;
  text?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export type PromoImageVariant = "full-width" | "image-text" | "overlay-text" | "gallery";

export interface PromoImageConfig {
  variant: PromoImageVariant;
  image?: BlockImageRef;
  images?: BlockImageRef[];
  imagePosition?: "left" | "right";
  heading?: string;
  text?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export type HomepageSectionType = "promo_banner" | "promo_image";

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  title: string | null;
  config: PromoBannerConfig | PromoImageConfig;
  enabled: boolean;
  position: number;
  startsAt: string | null;
  endsAt: string | null;
}

export function createHomepageSectionConfig(type: HomepageSectionType): PromoBannerConfig | PromoImageConfig {
  if (type === "promo_banner") {
    return { desktopImage: { mediaId: "", url: "", alt: "" }, heading: "" };
  }
  return { variant: "full-width" };
}

export const HOMEPAGE_SECTION_TYPE_LABELS: Record<HomepageSectionType, string> = {
  promo_banner: "Promotional banner",
  promo_image: "Promotional image section",
};
