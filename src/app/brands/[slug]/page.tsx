import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandBySlug, getBrandsWithVisibleProducts } from "@/lib/data/brands";
import { getProductsByBrandSlug } from "@/lib/data/products";
import { ProductCard } from "@/components/product/product-card";

export const revalidate = 60;

export async function generateStaticParams() {
  const brands = await getBrandsWithVisibleProducts();
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  return {
    title: `${brand.name} — Shop all products`,
    description: brand.description || `${brand.name} 3D printers and materials, available in Pakistan at INFiLLPK.`,
    alternates: { canonical: `/brands/${brand.slug}` },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const products = await getProductsByBrandSlug(slug);

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="flex items-center gap-4">
        {brand.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import
          <img src={brand.logoUrl} alt={brand.name} className="h-14 w-auto object-contain" />
        )}
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{brand.name}</h1>
      </div>
      {brand.description && <p className="mt-3 max-w-2xl text-ink-muted">{brand.description}</p>}
      <p className="mt-2 text-sm text-ink-muted">
        {products.length} {products.length === 1 ? "product" : "products"}
      </p>

      {products.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border-strong p-10 text-center text-sm text-ink-muted">
          No products from {brand.name} right now.
        </div>
      )}
    </div>
  );
}
