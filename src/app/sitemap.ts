import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/data/products";
import { getAllPublishedPages } from "@/lib/data/pages";
import { getPublishedArticles } from "@/lib/data/articles";
import { categoryDefs } from "@/components/category/category-config";

const BASE_URL = "https://infillpk.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, cmsPages, articles] = await Promise.all([
    getAllProducts(),
    getAllPublishedPages(),
    getPublishedArticles(),
  ]);
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/services",
    "/lab",
    "/compare",
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

  const productRoutes = products
    .filter((p) => p.includeInSitemap !== false)
    .map((p) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const articleRoutes = articles
    .filter((a) => !a.noindex)
    .map((a) => ({
      url: `${BASE_URL}/lab/${a.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  const cmsPageRoutes = cmsPages
    .filter((p) => !p.noindex)
    .map((p) => ({
      url: `${BASE_URL}/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...articleRoutes, ...cmsPageRoutes];
}
