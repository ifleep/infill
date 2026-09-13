"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBagOpen } from "@phosphor-icons/react";
import { useCartStore, useCartTotal } from "@/components/cart/cart-store";
import { formatPKR } from "@/lib/format";
import { LinkButton } from "@/components/ui/button";
import { products } from "@/lib/data/products";
import { ProductCard } from "@/components/product/product-card";

export default function CartPage() {
  const hydrate = useCartStore((s) => s.hydrate);
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartTotal();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const recommendations = products
    .filter((p) => (p.category === "filament" || p.category === "parts") && !lines.some((l) => l.productId === p.id))
    .slice(0, 4);

  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Your Cart</h1>

      {lines.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong py-20 text-center">
          <ShoppingBagOpen size={40} weight="thin" className="text-ink-faint" />
          <p className="text-sm text-ink-muted">Your cart is empty.</p>
          <LinkButton href="/category/3d-printers" className="mt-2">
            Shop 3D Printers
          </LinkButton>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-border rounded-xl border border-border">
            {lines.map((line) => (
              <li key={line.productId} className="flex flex-wrap items-center gap-4 p-5">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-xs uppercase tracking-wide text-ink-faint">{line.brandName}</p>
                  <Link
                    href={`/products/${line.slug}`}
                    className="focus-ring text-sm font-semibold text-ink hover:text-blue-700"
                  >
                    {line.name}
                  </Link>
                </div>
                <div className="flex items-center rounded-md border border-border-strong">
                  <button
                    aria-label={`Decrease quantity of ${line.name}`}
                    onClick={() => setQuantity(line.productId, line.quantity - 1)}
                    className="focus-ring flex h-9 w-9 cursor-pointer items-center justify-center text-ink hover:bg-surface-sunken"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="tabular w-8 text-center text-sm">{line.quantity}</span>
                  <button
                    aria-label={`Increase quantity of ${line.name}`}
                    onClick={() => setQuantity(line.productId, line.quantity + 1)}
                    className="focus-ring flex h-9 w-9 cursor-pointer items-center justify-center text-ink hover:bg-surface-sunken"
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <p className="tabular w-28 text-right text-sm font-semibold text-ink">
                  {formatPKR(line.price * line.quantity)}
                </p>
                <button
                  onClick={() => removeItem(line.productId)}
                  className="focus-ring cursor-pointer text-xs text-ink-faint underline-offset-2 hover:text-destructive hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="h-fit rounded-xl border border-border p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Order summary</h2>
            <div className="mt-4 flex justify-between text-sm text-ink-muted">
              <span>Subtotal</span>
              <span className="tabular">{formatPKR(total)}</span>
            </div>
            <p className="mt-1 text-xs text-ink-faint">Shipping and any duties calculated at checkout.</p>
            <LinkButton href="/checkout" size="lg" className="mt-5 w-full">
              Checkout
            </LinkButton>
            <LinkButton href="/category/3d-printers" variant="ghost" className="mt-2 w-full">
              Continue shopping
            </LinkButton>
          </div>
        </div>
      )}

      {lines.length > 0 && recommendations.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold text-ink">You may also need&hellip;</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
