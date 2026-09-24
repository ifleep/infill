import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryDef, categoryDefs } from "@/components/category/category-config";
import { getProductsByCategory } from "@/lib/data/products";
import { ProductCard } from "@/components/product/product-card";
import { CategoryFilters, type ActiveFilters } from "@/components/category/category-filters";
import { SortSelect } from "@/components/category/sort-select";
import { Pagination } from "@/components/category/pagination";

const PAGE_SIZE = 24;

// See the comment on `revalidate` in src/app/page.tsx — same reasoning
// applies here (listed prices/stock/availability are admin-editable).
export const revalidate = 60;

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
    priceMin: firstParam(sp.priceMin),
    priceMax: firstParam(sp.priceMax),
  };

  const productsInCategory = await getProductsByCategory(def.productCategory);

  const priceMin = current.priceMin ? Number(current.priceMin) : undefined;
  const priceMax = current.priceMax ? Number(current.priceMax) : undefined;

  const filtered = productsInCategory.filter((p) => {
    if (current.tech && !p.technology?.includes(current.tech as never)) return false;
    if (current.sub && p.subcategory !== current.sub) return false;
    if (current.level && !p.experienceLevel?.includes(current.level as never)) return false;
    if (current.use && !p.useCases?.includes(current.use as never)) return false;
    if (current.brand && p.brandSlug !== current.brand) return false;
    if (priceMin !== undefined && p.price < priceMin) return false;
    if (priceMax !== undefined && p.price > priceMax) return false;
    return true;
  });

  const showPrinterFacets = def.productCategory === "printers";

  const sort = firstParam(sp.sort) ?? "featured";
  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      case "featured":
      default:
        if ((b.featured ? 1 : 0) !== (a.featured ? 1 : 0)) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return a.name.localeCompare(b.name);
    }
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(Number(firstParam(sp.page)) || 1, 1), totalPages);
  const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Every filter except sort/page — reused as the base for both the sort
  // dropdown (picking a new sort resets to page 1) and page links (which
  // add `page` back on top of this).
  const filterParams = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) {
    if (v) filterParams.set(k, v);
  }

  function hrefForPage(page: number) {
    const params = new URLSearchParams(filterParams);
    if (sort !== "featured") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/category/${slug}?${qs}` : `/category/${slug}`;
  }

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
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-ink-muted">
              {sorted.length} {sorted.length === 1 ? "result" : "results"}
            </p>
            {sorted.length > 0 && (
              <SortSelect base={`/category/${slug}`} otherParams={filterParams.toString()} current={sort} />
            )}
          </div>
          {paged.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {paged.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} hrefForPage={hrefForPage} />
            </>
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
