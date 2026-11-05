import type { MetadataRoute } from "next";
import { getVisibleProducts } from "@/lib/data/products";
import { getAllPublishedPages } from "@/lib/data/pages";
import { getPublishedArticles } from "@/lib/data/articles";
import { getBrandsWithVisibleProducts } from "@/lib/data/brands";
import { categoryDefs } from "@/components/category/category-config";
import { prisma } from "@/lib/db";

const BASE_URL = "https://infillpk.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, cmsPages, articles, brands, productMeta, pageMeta, articleMeta, brandMeta] = await Promise.all([
    getVisibleProducts(),
    getAllPublishedPages(),
    getPublishedArticles(),
    getBrandsWithVisibleProducts(),
    // The existing data-layer functions above already apply visibility/noindex
    // filtering and shape their own return types without `updatedAt` — rather
    // than growing those shared types for every caller, pull just {slug,
    // updatedAt} here and join by slug, so real lastmod dates cost nothing
    // outside this file.
    prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.page.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.article.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.brand.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const productUpdatedAt = new Map(productMeta.map((p) => [p.slug, p.updatedAt]));
  const pageUpdatedAt = new Map(pageMeta.map((p) => [p.slug, p.updatedAt]));
  const articleUpdatedAt = new Map(articleMeta.map((a) => [a.slug, a.updatedAt]));
  const brandUpdatedAt = new Map(brandMeta.map((b) => [b.slug, b.updatedAt]));

  // No real per-item timestamp exists for these — they're static routes or
  // computed listings, not a single DB row. Omitting lastModified here is
  // honest; stamping today's date on every one of them on every deploy is
  // exactly the "all identical, changes on every deploy" failure mode a
  // lastmod audit checks for.
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/services",
    "/lab",
    "/compare",
    "/sitemap-page",
    "/brands",
    "/print-price-calculator",
    "/legal/privacy",
    "/legal/shipping",
    "/legal/returns",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const categoryRoutes = categoryDefs.map((c) => ({
    url: `${BASE_URL}/category/${c.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const brandRoutes = brands.map((b) => ({
    url: `${BASE_URL}/brands/${b.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
    ...(brandUpdatedAt.has(b.slug) ? { lastModified: brandUpdatedAt.get(b.slug) } : {}),
  }));

  const productRoutes = products
    .filter((p) => p.includeInSitemap !== false)
    .map((p) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      ...(productUpdatedAt.has(p.slug) ? { lastModified: productUpdatedAt.get(p.slug) } : {}),
    }));

  const articleRoutes = articles
    .filter((a) => !a.noindex)
    .map((a) => ({
      url: `${BASE_URL}/lab/${a.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      ...(articleUpdatedAt.has(a.slug) ? { lastModified: articleUpdatedAt.get(a.slug) } : {}),
    }));

  const cmsPageRoutes = cmsPages
    .filter((p) => !p.noindex)
    .map((p) => ({
      url: `${BASE_URL}/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
      ...(pageUpdatedAt.has(p.slug) ? { lastModified: pageUpdatedAt.get(p.slug) } : {}),
    }));

  return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...productRoutes, ...articleRoutes, ...cmsPageRoutes];
}
