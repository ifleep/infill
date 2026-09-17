"use client";

import { useEffect, useState } from "react";
import { Heart } from "@phosphor-icons/react";
import { useWishlistStore } from "@/components/wishlist/wishlist-store";
import { ProductCard } from "@/components/product/product-card";
import { LinkButton } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export function WishlistView() {
  const hydrate = useWishlistStore((s) => s.hydrate);
  const ids = useWishlistStore((s) => s.ids);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const saved = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));

  if (saved.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <Heart size={40} weight="thin" className="text-ink-faint" />
        <h1 className="font-display text-2xl font-semibold text-ink">Your wishlist is empty</h1>
        <p className="max-w-sm text-sm text-ink-muted">
          Tap the heart on any product to save it here — it stays in this browser, no account needed.
        </p>
        <LinkButton href="/category/3d-printers">Browse 3D Printers</LinkButton>
      </div>
    );
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Your Wishlist</h1>
      <p className="mt-2 text-ink-muted">
        {saved.length} {saved.length === 1 ? "product" : "products"} saved in this browser.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {saved.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
