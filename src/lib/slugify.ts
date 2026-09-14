// Shared by every admin-editable content type with a URL slug (products,
// pages, articles) — kept as one implementation so slugs stay consistent
// across the CMS.
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
