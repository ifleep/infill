import type { PageInput } from "@/lib/data/pages";
import { parseContentBlocks } from "@/lib/content-blocks/types";
import { slugify } from "@/lib/slugify";

export function validatePageInput(body: unknown, fallbackSlug?: string): { input: PageInput } | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title) return { error: "Title is required." };

  const status = b.status === "draft" ? "draft" : "published";
  const contentBlocks = parseContentBlocks(b.contentBlocks);

  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

  const rawSlug = typeof b.slug === "string" && b.slug.trim() ? b.slug : (fallbackSlug ?? title);
  const slug = slugify(rawSlug);
  if (!slug) return { error: "Could not generate a URL slug from that title." };

  return {
    input: {
      slug,
      title,
      status,
      contentBlocks,
      seoTitle: str(b.seoTitle),
      metaDescription: str(b.metaDescription),
      canonicalUrl: str(b.canonicalUrl),
      ogTitle: str(b.ogTitle),
      ogDescription: str(b.ogDescription),
      noindex: Boolean(b.noindex),
    },
  };
}
