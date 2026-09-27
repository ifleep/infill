"use client";

import { useState } from "react";
import { Star } from "@phosphor-icons/react";
import type { Product } from "@/lib/types";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToCartPanel } from "@/components/product/add-to-cart-panel";
import { LimitedStockBadge } from "@/components/product/limited-stock-badge";
import { SaleTimer } from "@/components/product/sale-timer";
import { SoldCount } from "@/components/product/sold-count";
import { WishlistToggle } from "@/components/wishlist/wishlist-toggle";
import { CompareToggle } from "@/components/compare/compare-toggle";

/**
 * Wraps the gallery and the buy panel in one client component so a color
 * selection in AddToCartPanel can swap the photo shown in ProductGallery —
 * they're on opposite sides of the page's two-column layout, so the
 * selected-variant id has to live above both of them.
 */
export function ProductPurchaseSection({
  product,
  stats,
}: {
  product: Product;
  stats: { label: string; value: string | null }[];
}) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants.find((v) => v.isDefault)?.id ?? product.variants[0]?.id
  );
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div>
        <ProductGallery product={product} variantImageUrl={selectedVariant?.imageUrl} />
      </div>

      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-ink-faint">{product.brandName}</p>
        <h1 className="font-display mt-1 text-3xl font-semibold text-ink sm:text-4xl">{product.name}</h1>

        {product.rating && product.reviewCount ? (
          <div className="mt-3 flex items-center gap-1.5 text-sm text-ink-muted">
            <Star size={16} weight="fill" className="text-amber-600" />
            <span className="tabular font-medium text-ink">{product.rating}</span>
            <span>({product.reviewCount} reviews)</span>
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-faint">No reviews yet</p>
        )}

        <p className="mt-4 text-base text-ink-muted">{product.shortDescription}</p>

        <div className="mt-3">
          <LimitedStockBadge product={product} className="mt-1.5" />
          <SaleTimer saleEndsAt={product.saleEndsAt} className="mt-1.5" />
          <SoldCount product={product} className="mt-1.5" />
        </div>

        <AddToCartPanel
          product={product}
          brandName={product.brandName}
          selectedVariantId={selectedVariantId}
          onSelectVariant={setSelectedVariantId}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <WishlistToggle productId={product.id} />
          <CompareToggle productId={product.id} />
        </div>

        {stats.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-xs uppercase tracking-wide text-ink-faint">{s.label}</p>
                <p className="tabular mt-1 text-sm font-semibold text-ink">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
