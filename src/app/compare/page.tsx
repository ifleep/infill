"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "@phosphor-icons/react";
import { useCompareStore } from "@/components/compare/compare-store";
import { products } from "@/lib/data/products";
import { getBrandById } from "@/lib/data";
import { ProductVisual } from "@/components/product/product-visual";
import { formatPKR } from "@/lib/format";
import { LinkButton } from "@/components/ui/button";

const fields: { label: string; get: (p: (typeof products)[number]) => string }[] = [
  { label: "Price", get: (p) => formatPKR(p.price) },
  { label: "Technology", get: (p) => p.technology ?? p.subcategory },
  {
    label: "Build volume",
    get: (p) => (p.buildVolume ? `${p.buildVolume.x} × ${p.buildVolume.y} × ${p.buildVolume.z} mm` : "—"),
  },
  { label: "Max speed", get: (p) => (p.speedMmPerSec ? `${p.speedMmPerSec} mm/s` : "—") },
  { label: "Materials", get: (p) => p.materials?.join(", ") ?? "—" },
  { label: "Weight", get: (p) => (p.weightKg ? `${p.weightKg} kg` : "—") },
  {
    label: "Dimensions",
    get: (p) =>
      p.dimensions ? `${p.dimensions.width} × ${p.dimensions.depth} × ${p.dimensions.height} mm` : "—",
  },
  { label: "Warranty", get: (p) => `${p.warrantyMonths} months` },
];

export default function ComparePage() {
  const hydrate = useCompareStore((s) => s.hydrate);
  const ids = useCompareStore((s) => s.ids);
  const toggle = useCompareStore((s) => s.toggle);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const selected = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Compare printers</h1>
      <p className="mt-2 text-ink-muted">Compare up to three products side by side.</p>

      {selected.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border-strong p-10 text-center">
          <p className="text-sm text-ink-muted">
            Nothing to compare yet. Add products from any listing page using &ldquo;Add to Compare&rdquo;.
          </p>
          <LinkButton href="/category/3d-printers" className="mt-4">
            Browse 3D Printers
          </LinkButton>
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto">
          <div
            className="grid min-w-[640px] gap-px overflow-hidden rounded-xl border border-border bg-border"
            style={{ gridTemplateColumns: `160px repeat(${selected.length}, minmax(200px, 1fr))` }}
          >
            <div className="bg-surface-sunken" />
            {selected.map((p) => {
              const brand = getBrandById(p.brandId);
              return (
                <div key={p.id} className="relative bg-surface p-4">
                  <button
                    onClick={() => toggle(p.id)}
                    aria-label={`Remove ${p.name} from comparison`}
                    className="focus-ring absolute right-2 top-2 cursor-pointer rounded p-1 text-ink-faint hover:bg-surface-sunken"
                  >
                    <X size={16} />
                  </button>
                  <ProductVisual product={p} className="mx-auto max-w-[120px]" />
                  <p className="mt-2 text-center text-xs text-ink-faint">{brand?.name}</p>
                  <Link
                    href={`/products/${p.slug}`}
                    className="focus-ring block text-center text-sm font-semibold text-ink hover:text-blue-700"
                  >
                    {p.name}
                  </Link>
                </div>
              );
            })}

            {fields.map((field) => (
              <div key={field.label} className="contents">
                <div className="bg-surface-sunken p-4 text-sm font-medium text-ink">{field.label}</div>
                {selected.map((p) => (
                  <div key={p.id + field.label} className="tabular bg-surface p-4 text-sm text-ink-muted">
                    {field.get(p)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
