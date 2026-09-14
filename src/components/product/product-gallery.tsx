"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductVisual } from "@/components/product/product-visual";

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);

  if (product.images.length === 0) {
    return <ProductVisual product={product} className="w-full" eager />;
  }

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-xl bg-surface-sunken">
        {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
        <img
          src={product.images[active]}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>
      {product.images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {product.images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={`focus-ring aspect-square overflow-hidden rounded-md bg-surface-sunken transition-opacity ${
                i === active ? "ring-2 ring-blue-500" : "opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
