import type { Metadata } from "next";
import Link from "next/link";
import { getBrandsWithVisibleProducts } from "@/lib/data/brands";

export const metadata: Metadata = {
  title: "Brands",
  description: "3D printing and digital fabrication brands available at INFiLLPK — Bambu Lab, Anycubic, Creality, Elegoo and more.",
  alternates: { canonical: "/brands" },
};

export const revalidate = 60;

export default async function BrandsIndexPage() {
  const brands = await getBrandsWithVisibleProducts();

  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Brands</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">
        Every 3D printing and digital fabrication brand we carry, in one place.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((b) => (
          <Link
            key={b.slug}
            href={`/brands/${b.slug}`}
            className="focus-ring group flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6 text-center transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            {b.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import
              <img src={b.logoUrl} alt={b.name} className="h-12 w-auto object-contain" />
            ) : (
              <span className="font-display text-lg font-semibold text-ink">{b.name}</span>
            )}
            <span className="text-sm font-medium text-ink group-hover:text-blue-700">{b.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
