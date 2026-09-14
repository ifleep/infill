import type { ArticleInput } from "@/lib/data/articles";
import type { Article } from "@/lib/types";
import { parseContentBlocks } from "@/lib/content-blocks/types";
import { slugify } from "@/lib/slugify";

const CATEGORIES: Article["category"][] = ["Buying Guide", "Comparison", "Materials", "Maintenance", "Technology"];

export function validateArticleInput(body: unknown, fallbackSlug?: string): { input: ArticleInput } | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title) return { error: "Title is required." };

  const excerpt = typeof b.excerpt === "string" ? b.excerpt.trim() : "";
  if (!excerpt) return { error: "Excerpt is required." };

  const category = CATEGORIES.includes(b.category as Article["category"])
    ? (b.category as Article["category"])
    : "Technology";
  const readingMinutes = Number(b.readingMinutes);
  const status: Article["status"] = b.status === "draft" || b.status === "scheduled" ? b.status : "published";
  const contentBlocks = parseContentBlocks(b.contentBlocks);
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

  const rawSlug = typeof b.slug === "string" && b.slug.trim() ? b.slug : (fallbackSlug ?? title);
  const slug = slugify(rawSlug);
  if (!slug) return { error: "Could not generate a URL slug from that title." };

  return {
    input: {
      slug,
      title,
      excerpt,
      category,
      readingMinutes: Number.isFinite(readingMinutes) && readingMinutes > 0 ? Math.round(readingMinutes) : 4,
      publishedAt: typeof b.publishedAt === "string" && b.publishedAt ? b.publishedAt : null,
      contentBlocks,
      author: str(b.author),
      featuredImageId: str(b.featuredImageId),
      status,
      relatedProductIds: Array.isArray(b.relatedProductIds)
        ? b.relatedProductIds.filter((i): i is string => typeof i === "string")
        : [],
      seoTitle: str(b.seoTitle),
      metaDescription: str(b.metaDescription),
      canonicalUrl: str(b.canonicalUrl),
      ogTitle: str(b.ogTitle),
      ogDescription: str(b.ogDescription),
      noindex: Boolean(b.noindex),
    },
  };
}
