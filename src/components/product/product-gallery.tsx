"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductVisual } from "@/components/product/product-visual";

/**
 * `variantImageUrl` (the selected color's photo — see ProductPurchaseSection)
 * takes over as the main photo until the shopper manually picks a thumbnail,
 * at which point their pick wins until the color changes again.
 */
export function ProductGallery({ product, variantImageUrl }: { product: Product; variantImageUrl?: string }) {
  const [active, setActive] = useState(0);
  const [manualPick, setManualPick] = useState(false);
  // Reset the manual override when the color changes, computed during
  // render (not an effect) per React's "adjusting state" guidance.
  const [prevVariantImageUrl, setPrevVariantImageUrl] = useState(variantImageUrl);
  if (variantImageUrl !== prevVariantImageUrl) {
    setPrevVariantImageUrl(variantImageUrl);
    setManualPick(false);
  }

  const mainSrc = !manualPick && variantImageUrl ? variantImageUrl : product.images[active];

  if (!mainSrc) {
    return <ProductVisual product={product} className="w-full" eager />;
  }

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-xl bg-surface-sunken">
        {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
        <img
          src={mainSrc}
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
              onClick={() => {
                setActive(i);
                setManualPick(true);
              }}
              aria-label={`Show photo ${i + 1}`}
              aria-current={!manualPick && variantImageUrl ? false : i === active}
              className={`focus-ring aspect-square overflow-hidden rounded-md bg-surface-sunken transition-opacity ${
                !manualPick && variantImageUrl
                  ? "opacity-70 hover:opacity-100"
                  : i === active
                    ? "ring-2 ring-blue-500"
                    : "opacity-70 hover:opacity-100"
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
