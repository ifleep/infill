"use client";

import { Heart } from "@phosphor-icons/react";
import { useWishlistStore } from "@/components/wishlist/wishlist-store";

/** Full button, matching CompareToggle's style — used on the product detail page. */
export function WishlistToggle({ productId }: { productId: string }) {
  const ids = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);
  const active = ids.includes(productId);

  return (
    <button
      onClick={() => toggle(productId)}
      aria-pressed={active}
      className={`focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3.5 py-2 text-sm font-medium transition-colors ${
        active ? "border-blue-700 bg-blue-50 text-blue-700" : "border-border-strong text-ink hover:bg-surface-sunken"
      }`}
    >
      <Heart size={16} weight={active ? "fill" : "regular"} />
      {active ? "Added to Wishlist" : "Add to Wishlist"}
    </button>
  );
}

/** Compact icon-only variant — overlaid on a product card's image. */
export function WishlistIconToggle({ productId, name }: { productId: string; name: string }) {
  const ids = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);
  const active = ids.includes(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      className={`focus-ring flex h-8 w-8 cursor-pointer items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
        active ? "bg-white text-blue-700" : "bg-white/80 text-ink-muted hover:bg-white hover:text-blue-700"
      }`}
    >
      <Heart size={16} weight={active ? "fill" : "regular"} />
    </button>
  );
}
