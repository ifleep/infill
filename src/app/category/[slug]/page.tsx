import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryDef, categoryDefs } from "@/components/category/category-config";
import { products } from "@/lib/data/products";
import { brands } from "@/lib/data/brands";
import { ProductCard } from "@/components/product/product-card";
import { CategoryFilters, type ActiveFilters } from "@/components/category/category-filters";

export function generateStaticParams() {
  return categoryDefs.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const def = getCategoryDef(slug);
  if (!def) return {};
  return {
    title: def.title,
    description: def.description,
    alternates: { canonical: `/category/${def.slug}` },
  };
}

function firstParam(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const def = getCategoryDef(slug);
  if (!def) notFound();

  const current: ActiveFilters = {
    tech: firstParam(sp.tech),
    level: firstParam(sp.level),
    use: firstParam(sp.use),
    brand: firstParam(sp.brand),
    sub: firstParam(sp.sub),
  };

  const productsInCategory = products.filter((p) => p.category === def.productCategory);

  const filtered = productsInCategory.filter((p) => {
    if (current.tech && p.technology !== current.tech) return false;
    if (current.sub && p.subcategory !== current.sub) return false;
    if (current.level && !p.experienceLevel?.includes(current.level as never)) return false;
    if (current.use && !p.useCases?.includes(current.use as never)) return false;
    if (current.brand) {
      const brand = brands.find((b) => b.slug === current.brand);
      if (!brand || p.brandId !== brand.id) return false;
    }
    return true;
  });

  const showPrinterFacets = def.productCategory === "printers";

  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{def.title}</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">{def.description}</p>

      <div className="mt-10 flex flex-col gap-10 lg:flex-row">
        <CategoryFilters
          base={`/category/${slug}`}
          current={current}
          productsInCategory={productsInCategory}
          showPrinterFacets={showPrinterFacets}
        />

        <div className="flex-1">
          <p className="mb-4 text-sm text-ink-muted">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </p>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border-strong p-10 text-center text-sm text-ink-muted">
              No products match these filters yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
