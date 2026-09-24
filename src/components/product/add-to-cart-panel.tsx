"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "@phosphor-icons/react";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/components/cart/cart-store";
import { Button } from "@/components/ui/button";
import { StockUrgency } from "@/components/product/stock-urgency";
import { AvailabilityStatus } from "@/components/product/availability-badge";
import { formatPKR } from "@/lib/format";

/**
 * Renders the price, the variant selector (when the product has more than
 * one purchasable configuration — see ProductVariant), availability, and
 * the actual Add to Cart / Buy Now controls, all driven by whichever
 * variant is currently selected. A product with no variants behaves
 * exactly as before this existed: price/availability/stock come straight
 * from the product itself.
 */
export function AddToCartPanel({ product, brandName }: { product: Product; brandName: string }) {
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants.find((v) => v.isDefault)?.id ?? product.variants[0]?.id
  );
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);

  const variant = product.variants.find((v) => v.id === selectedVariantId);
  const price = variant?.price ?? product.price;
  const compareAtPrice = variant?.compareAtPrice ?? product.compareAtPrice;
  const availability = variant?.availability ?? product.availability;
  const stock = variant?.stock ?? product.stock;
  const addLabel =
    availability === "preorder" ? "Preorder" : availability === "out-of-stock" ? "Backorder" : "Add to Cart";

  return (
    <div className="mt-5">
      <div className="flex items-baseline gap-3">
        <span className="tabular text-3xl font-semibold text-ink">{formatPKR(price)}</span>
        {compareAtPrice && (
          <span className="tabular text-base text-ink-faint line-through">{formatPKR(compareAtPrice)}</span>
        )}
      </div>

      {product.variants.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Choose a configuration">
          {product.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={v.id === selectedVariantId}
              onClick={() => {
                setSelectedVariantId(v.id);
                setQty(1);
              }}
              className={`focus-ring cursor-pointer rounded-md border px-3 py-2 text-sm font-medium ${
                v.id === selectedVariantId
                  ? "border-blue-700 bg-blue-50 text-blue-700"
                  : "border-border-strong text-ink hover:bg-surface-sunken"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3">
        <AvailabilityStatus availability={availability} stock={stock} preorderLeadDays={product.preorderLeadDays} />
      </div>

      {product.quoteOnly ? (
        <div className="mt-6">
          <Link
            href={`/contact?type=quote&product=${product.slug}`}
            className="focus-ring inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-md bg-blue-700 px-6 text-sm font-medium text-white hover:bg-blue-600 sm:w-auto sm:px-10"
          >
            Request a Quote
          </Link>
          <p className="mt-2 text-xs text-ink-faint">
            Industrial equipment — pricing confirmed with our sales team.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-md border border-border-strong">
            <button
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="focus-ring flex h-11 w-10 cursor-pointer items-center justify-center text-ink hover:bg-surface-sunken"
            >
              <Minus size={14} />
            </button>
            <span className="tabular w-8 text-center text-sm">{qty}</span>
            <button
              aria-label="Increase quantity"
              onClick={() => setQty((q) => q + 1)}
              className="focus-ring flex h-11 w-10 cursor-pointer items-center justify-center text-ink hover:bg-surface-sunken"
            >
              <Plus size={14} />
            </button>
          </div>
          <Button
            size="lg"
            onClick={() => {
              addItem(product, brandName, qty, variant);
            }}
          >
            {addLabel}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              addItem(product, brandName, qty, variant);
              openCart();
            }}
          >
            Buy Now
          </Button>
          {availability === "preorder" && (
            <p className="w-full text-xs text-ink-faint">
              Ships in approximately {product.preorderLeadDays} days.
            </p>
          )}
          {availability === "out-of-stock" && (
            <p className="w-full text-xs text-ink-faint">
              Currently out of stock — we&rsquo;ll confirm delivery timing with you directly after you order.
            </p>
          )}
          <StockUrgency product={product} className="w-full" />
        </div>
      )}
    </div>
  );
}
