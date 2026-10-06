import { prisma } from "@/lib/db";

function collectStrings(value: unknown, out: Set<string>) {
  if (typeof value === "string") {
    if (value) out.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectStrings(v, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) collectStrings(v, out);
  }
}

/**
 * Every place a Media Library item can be referenced, collapsed into one
 * set of strings mixing ids and URLs together on purpose. Most references
 * store a Media id (ProductMedia, Brand.logoMediaId, Article.featuredImageId,
 * the various ogImageMediaId columns, and every content-block image's
 * BlockImageRef.mediaId — see content-blocks/types.ts), but a few only
 * ever stored a raw URL (a product variant's swatch photo, a content
 * block's download file). Deep-scanning every string value in every JSON
 * blob (contentBlocks, homepage section config, site settings) catches
 * both without needing to special-case each block/config shape — and it
 * only ever errs toward treating MORE things as "in use", never fewer,
 * which is the safe direction for something that backs a delete.
 */
export async function getUsedMediaRefs(): Promise<Set<string>> {
  const used = new Set<string>();

  const [productMedia, brands, products, pages, articles, variants, sections, settings] = await Promise.all([
    prisma.productMedia.findMany({ select: { mediaId: true } }),
    prisma.brand.findMany({ where: { logoMediaId: { not: null } }, select: { logoMediaId: true } }),
    prisma.product.findMany({ select: { contentBlocks: true, ogImageMediaId: true } }),
    prisma.page.findMany({ select: { contentBlocks: true, ogImageMediaId: true } }),
    prisma.article.findMany({
      select: { contentBlocks: true, ogImageMediaId: true, featuredImageId: true },
    }),
    prisma.productVariant.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    prisma.homepageSection.findMany({ select: { config: true } }),
    prisma.siteSetting.findMany({ select: { value: true } }),
  ]);

  for (const pm of productMedia) used.add(pm.mediaId);
  for (const b of brands) if (b.logoMediaId) used.add(b.logoMediaId);
  for (const v of variants) if (v.imageUrl) used.add(v.imageUrl);

  for (const p of products) {
    if (p.ogImageMediaId) used.add(p.ogImageMediaId);
    collectStrings(p.contentBlocks, used);
  }
  for (const p of pages) {
    if (p.ogImageMediaId) used.add(p.ogImageMediaId);
    collectStrings(p.contentBlocks, used);
  }
  for (const a of articles) {
    if (a.ogImageMediaId) used.add(a.ogImageMediaId);
    if (a.featuredImageId) used.add(a.featuredImageId);
    collectStrings(a.contentBlocks, used);
  }
  for (const s of sections) collectStrings(s.config, used);
  for (const s of settings) collectStrings(s.value, used);

  return used;
}

export function isMediaUnused(media: { id: string; url: string }, used: Set<string>): boolean {
  return !used.has(media.id) && !used.has(media.url);
}
