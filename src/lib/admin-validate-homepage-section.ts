import type { HomepageSectionInput } from "@/lib/data/homepage-sections";
import type { BlockImageRef } from "@/lib/content-blocks/types";
import type { PromoBannerConfig, PromoImageConfig, PromoImageVariant } from "@/lib/content-blocks/homepage-types";

function parseImageRef(value: unknown): BlockImageRef | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const v = value as Record<string, unknown>;
  if (typeof v.mediaId !== "string" || typeof v.url !== "string") return undefined;
  return {
    mediaId: v.mediaId,
    url: v.url,
    alt: typeof v.alt === "string" ? v.alt : "",
    caption: typeof v.caption === "string" ? v.caption : undefined,
  };
}

export function validateHomepageSectionInput(
  body: unknown
): { input: HomepageSectionInput } | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;

  const type = b.type;
  if (type !== "promo_banner" && type !== "promo_image") {
    return { error: "Invalid section type." };
  }
  const title = typeof b.title === "string" && b.title.trim() ? b.title.trim() : null;
  const enabled = Boolean(b.enabled);
  const startsAt = typeof b.startsAt === "string" && b.startsAt ? b.startsAt : null;
  const endsAt = typeof b.endsAt === "string" && b.endsAt ? b.endsAt : null;

  const rawConfig = typeof b.config === "object" && b.config !== null ? (b.config as Record<string, unknown>) : {};

  // Sections can be saved incomplete as a draft while the admin is still
  // filling them in — the public renderer (homepage-promo-sections.tsx)
  // already no-ops on a missing image/heading, so nothing broken can ever
  // reach the live site; requiring every field up front here would just
  // make "Add section" fail immediately with nothing to fill in yet.
  let config: PromoBannerConfig | PromoImageConfig;
  if (type === "promo_banner") {
    const desktopImage = parseImageRef(rawConfig.desktopImage) ?? { mediaId: "", url: "", alt: "" };
    const heading = typeof rawConfig.heading === "string" ? rawConfig.heading.trim() : "";
    config = {
      desktopImage,
      mobileImage: parseImageRef(rawConfig.mobileImage),
      heading,
      text: typeof rawConfig.text === "string" ? rawConfig.text : undefined,
      buttonText: typeof rawConfig.buttonText === "string" ? rawConfig.buttonText : undefined,
      buttonUrl: typeof rawConfig.buttonUrl === "string" ? rawConfig.buttonUrl : undefined,
    };
  } else {
    const variant: PromoImageVariant = ["full-width", "image-text", "overlay-text", "gallery"].includes(
      rawConfig.variant as string
    )
      ? (rawConfig.variant as PromoImageVariant)
      : "full-width";
    const images = Array.isArray(rawConfig.images)
      ? rawConfig.images.map(parseImageRef).filter((i): i is BlockImageRef => Boolean(i))
      : undefined;
    config = {
      variant,
      image: parseImageRef(rawConfig.image),
      images,
      imagePosition: rawConfig.imagePosition === "right" ? "right" : "left",
      heading: typeof rawConfig.heading === "string" ? rawConfig.heading : undefined,
      text: typeof rawConfig.text === "string" ? rawConfig.text : undefined,
      buttonText: typeof rawConfig.buttonText === "string" ? rawConfig.buttonText : undefined,
      buttonUrl: typeof rawConfig.buttonUrl === "string" ? rawConfig.buttonUrl : undefined,
    };
  }

  return { input: { type, title, config, enabled, startsAt, endsAt } };
}
