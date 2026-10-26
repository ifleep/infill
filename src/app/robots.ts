import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /category/*?* blocks the filter/sort/pagination combinations (tech, level,
      // use, brand, page, ...), not the base category pages — those combinations
      // all canonicalize back to the base page anyway (see category/[slug]/page.tsx),
      // and every product is already reachable via sitemap.xml independent of
      // category-page crawling, so there's nothing lost by keeping Google from
      // crawling the combinatorial blow-up of query-string variants.
      disallow: ["/cart", "/checkout", "/account", "/wishlist", "/admin", "/api", "/category/*?*"],
    },
    sitemap: "https://infillpk.com/sitemap.xml",
  };
}
