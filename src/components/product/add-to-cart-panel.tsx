"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "@phosphor-icons/react";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/components/cart/cart-store";
import { Button } from "@/components/ui/button";

export function AddToCartPanel({ product, brandName }: { product: Product; brandName: string }) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);

  if (product.quoteOnly) {
    return (
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
    );
  }

  return (
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
          addItem(product, brandName, qty);
        }}
      >
        Add to Cart
      </Button>
      <Button
        variant="secondary"
        size="lg"
        onClick={() => {
          addItem(product, brandName, qty);
          openCart();
        }}
      >
        Buy Now
      </Button>
    </div>
  );
}
