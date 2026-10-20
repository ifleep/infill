import type { Metadata } from "next";
import Link from "next/link";
import { getVisibleProducts } from "@/lib/data/products";
import { getAllPublishedPages } from "@/lib/data/pages";
import { getPublishedArticles } from "@/lib/data/articles";
import { categoryDefs } from "@/components/category/category-config";

export const metadata: Metadata = {
  title: "Sitemap",
  alternates: { canonical: "/sitemap-page" },
};

export const revalidate = 60;

const staticPages = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/services", label: "Services" },
  { href: "/lab", label: "Lab" },
  { href: "/compare", label: "Compare" },
];

/**
 * A real, crawlable page listing every product and category as plain
 * links — separate from sitemap.xml (which Google reads but a visitor
 * never sees). This gives Googlebot a dense set of internal links to
 * every product in one hop from the footer, instead of relying only on
 * category-page pagination to surface the full catalog.
 */
export default async function SitemapPage() {
  const [products, cmsPages, articles] = await Promise.all([
    getVisibleProducts(),
    getAllPublishedPages(),
    getPublishedArticles(),
  ]);

  const productsByCategory = new Map<string, typeof products>();
  for (const p of products) {
    if (p.includeInSitemap === false) continue;
    const list = productsByCategory.get(p.category) ?? [];
    list.push(p);
    productsByCategory.set(p.category, list);
  }
  for (const list of productsByCategory.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="container-page max-w-4xl py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Sitemap</h1>
      <p className="mt-2 text-sm text-ink-muted">Every page and product on INFiLLPK, in one place.</p>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">Pages</h2>
        <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
          {staticPages.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="focus-ring text-sm text-blue-700 hover:underline">
                {p.label}
              </Link>
            </li>
          ))}
          {cmsPages
            .filter((p) => !p.noindex)
            .map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}`} className="focus-ring text-sm text-blue-700 hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      {categoryDefs.map((c) => {
        const items = productsByCategory.get(c.productCategory);
        if (!items || items.length === 0) return null;
        return (
          <section key={c.slug} className="mt-10">
            <h2 className="font-display text-lg font-semibold text-ink">
              <Link href={`/category/${c.slug}`} className="focus-ring hover:underline">
                {c.title}
              </Link>
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
              {items.map((p) => (
                <li key={p.slug}>
                  <Link href={`/products/${p.slug}`} className="focus-ring text-sm text-blue-700 hover:underline">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {articles.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold text-ink">Lab articles</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
            {articles
              .filter((a) => !a.noindex)
              .map((a) => (
                <li key={a.slug}>
                  <Link href={`/lab/${a.slug}`} className="focus-ring text-sm text-blue-700 hover:underline">
                    {a.title}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
