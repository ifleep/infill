import type { MetadataRoute } from "next";
import { products } from "@/lib/data/products";
import { articles } from "@/lib/data/articles";
import { categoryDefs } from "@/components/category/category-config";

const BASE_URL = "https://infillpk.com";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const productRoutes = products.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const articleRoutes = articles.map((a) => ({
    url: `${BASE_URL}/lab/${a.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...articleRoutes];
}
