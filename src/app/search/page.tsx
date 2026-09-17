import { getAllProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/product/product-card";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  const products = query ? await getAllProducts() : [];

  const results = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.subcategory.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)) ||
          p.brandName.toLowerCase().includes(query)
      )
    : [];

  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
        {query ? `Results for "${q}"` : "Search"}
      </h1>
      <p className="mt-2 text-ink-muted">{results.length} products found</p>

      {results.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        query && (
          <div className="mt-10 rounded-xl border border-dashed border-border-strong p-10 text-center text-sm text-ink-muted">
            No products match &ldquo;{q}&rdquo;. Try a broader term or browse categories from the menu above.
          </div>
        )
      )}
    </div>
  );
}
