"use client";

import Link from "next/link";
import { Star, Plus } from "@phosphor-icons/react";
import type { Product } from "@/lib/types";
import { ProductVisual } from "@/components/product/product-visual";
import { AvailabilityBadge } from "@/components/product/availability-badge";
import { StockUrgency } from "@/components/product/stock-urgency";
import { formatPKR } from "@/lib/format";
import { getBrandById } from "@/lib/data/brands";
import { useCartStore } from "@/components/cart/cart-store";

function keySpec(product: Product) {
  if (product.buildVolume) {
    const { x, y, z } = product.buildVolume;
    return `${x} × ${y} × ${z} mm`;
  }
  if (product.category === "filament" || product.category === "resin") {
    return product.specifications[0]?.value ?? product.subcategory;
  }
  return product.subcategory;
}

export function ProductCard({ product }: { product: Product }) {
  const brand = getBrandById(product.brandId);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="focus-ring relative block p-4 pb-0">
        <ProductVisual product={product} className="transition-transform duration-300 group-hover:scale-[1.02]" />
        {product.compareAtPrice && (
          <span className="absolute left-6 top-6 rounded bg-destructive px-2 py-0.5 text-xs font-semibold text-white">
            Sale
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs uppercase tracking-wide text-ink-faint">{brand?.name}</p>
        <Link
          href={`/products/${product.slug}`}
          className="focus-ring mt-0.5 text-sm font-semibold text-ink hover:text-blue-700"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-xs text-ink-muted">{keySpec(product)}</p>

        {product.availability !== "in-stock" && (
          <div className="mt-1.5">
            <AvailabilityBadge availability={product.availability} />
          </div>
        )}
        <StockUrgency product={product} className="mt-1.5" />

        {product.rating && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-ink-muted">
            <Star size={13} weight="fill" className="text-amber-600" />
            <span className="tabular">{product.rating}</span>
            <span className="text-ink-faint">({product.reviewCount})</span>
          </div>
        )}

        <div className="mt-3 flex items-baseline gap-2">
          <span className="tabular text-base font-semibold text-ink">{formatPKR(product.price)}</span>
          {product.compareAtPrice && (
            <span className="tabular text-xs text-ink-faint line-through">
              {formatPKR(product.compareAtPrice)}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-ink-faint">Estimated price — confirmed at checkout</p>

        <div className="mt-4 flex gap-2">
          {product.quoteOnly ? (
            <Link
              href={`/contact?type=quote&product=${product.slug}`}
              className="focus-ring flex h-9 flex-1 cursor-pointer items-center justify-center rounded bg-blue-700 px-3 text-sm font-medium text-white hover:bg-blue-600"
            >
              Request a Quote
            </Link>
          ) : product.availability === "out-of-stock" ? (
            <button
              disabled
              className="flex h-9 flex-1 cursor-not-allowed items-center justify-center rounded bg-surface-sunken px-3 text-sm font-medium text-ink-faint"
            >
              Out of Stock
            </button>
          ) : (
            <button
              onClick={() => addItem(product, brand?.name ?? "")}
              className="focus-ring flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded bg-blue-700 px-3 text-sm font-medium text-white hover:bg-blue-600"
            >
              <Plus size={14} weight="bold" />
              {product.availability === "preorder" ? "Preorder" : "Add to Cart"}
            </button>
          )}
          <Link
            href={`/products/${product.slug}`}
            className="focus-ring flex h-9 flex-1 cursor-pointer items-center justify-center rounded border border-border-strong px-3 text-sm font-medium text-ink hover:bg-surface-sunken"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
