import { slugify, type ProductInput } from "@/lib/data/products";
import { parseContentBlocks } from "@/lib/content-blocks/types";

export function validateProductInput(body: unknown, fallbackSlug?: string): { input: ProductInput } | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const brandId = typeof b.brandId === "string" ? b.brandId : "";
  const category = typeof b.category === "string" ? b.category : "";
  const subcategory = typeof b.subcategory === "string" ? b.subcategory.trim() : "";
  const shortDescription = typeof b.shortDescription === "string" ? b.shortDescription.trim() : "";
  const description = typeof b.description === "string" ? b.description.trim() : "";
  const price = Number(b.price);
  const stock = Number(b.stock);
  const compareAtPrice =
    b.compareAtPrice === null || b.compareAtPrice === undefined || b.compareAtPrice === ""
      ? null
      : Number(b.compareAtPrice);
  const availability = typeof b.availability === "string" ? b.availability : "in-stock";
  const quoteOnly = Boolean(b.quoteOnly);
  const featured = Boolean(b.featured);
  // Absent entirely => leave existing photos alone (see ProductInput.mediaIds).
  const mediaIds = Array.isArray(b.mediaIds)
    ? b.mediaIds.filter((i): i is string => typeof i === "string")
    : undefined;
  // Same "absent => leave alone" convention as mediaIds.
  const contentBlocks = "contentBlocks" in b ? parseContentBlocks(b.contentBlocks) : undefined;

  // Same "absent => leave alone" convention as mediaIds/contentBlocks — the
  // quick-edit table never sends these, and must not blank out SEO fields
  // set from the full product editor on every price/stock save.
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const seoTitle = "seoTitle" in b ? str(b.seoTitle) : undefined;
  const metaDescription = "metaDescription" in b ? str(b.metaDescription) : undefined;
  const canonicalUrl = "canonicalUrl" in b ? str(b.canonicalUrl) : undefined;
  const ogTitle = "ogTitle" in b ? str(b.ogTitle) : undefined;
  const ogDescription = "ogDescription" in b ? str(b.ogDescription) : undefined;
  const noindex = "noindex" in b ? Boolean(b.noindex) : undefined;
  const includeInSitemap = "includeInSitemap" in b ? Boolean(b.includeInSitemap) : undefined;

  if (!name) return { error: "Name is required." };
  if (!brandId) return { error: "Brand is required." };
  if (!["printers", "filament", "resin", "parts", "machines"].includes(category)) {
    return { error: "Invalid category." };
  }
  if (!subcategory) return { error: "Type/subcategory is required." };
  if (!shortDescription) return { error: "Short description is required." };
  if (!description) return { error: "Description is required." };
  if (!Number.isFinite(price) || price < 0) return { error: "Price must be a non-negative number." };
  if (!Number.isFinite(stock) || stock < 0) return { error: "Stock must be a non-negative number." };
  if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)) {
    return { error: "Compare-at price must be a non-negative number." };
  }
  if (!["in-stock", "out-of-stock", "preorder"].includes(availability)) {
    return { error: "Invalid availability." };
  }

  const rawSlug = typeof b.slug === "string" && b.slug.trim() ? b.slug : (fallbackSlug ?? name);
  const slug = slugify(rawSlug);
  if (!slug) return { error: "Could not generate a URL slug from that name." };

  return {
    input: {
      slug,
      name,
      brandId,
      category: category as ProductInput["category"],
      subcategory,
      price,
      compareAtPrice,
      stock,
      availability: availability as ProductInput["availability"],
      quoteOnly,
      shortDescription,
      description,
      featured,
      mediaIds,
      contentBlocks,
      seoTitle,
      metaDescription,
      canonicalUrl,
      ogTitle,
      ogDescription,
      noindex,
      includeInSitemap,
    },
  };
}
