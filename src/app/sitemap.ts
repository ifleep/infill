import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/data/products";
import { getAllPublishedPages } from "@/lib/data/pages";
import { articles } from "@/lib/data/articles";
import { categoryDefs } from "@/components/category/category-config";

const BASE_URL = "https://infillpk.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, cmsPages] = await Promise.all([getAllProducts(), getAllPublishedPages()]);
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

  const articleRoutes = articles.map((a) => ({
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
