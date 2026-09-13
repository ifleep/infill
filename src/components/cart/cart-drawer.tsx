"use client";

import Link from "next/link";
import { X, Minus, Plus, ShoppingBagOpen } from "@phosphor-icons/react";
import { useCartStore, useCartTotal } from "@/components/cart/cart-store";
import { formatPKR } from "@/lib/format";
import { Button, LinkButton } from "@/components/ui/button";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartTotal();

  return (
    <>
      <div
        className={`fixed inset-0 z-90 bg-ink/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        inert={!isOpen}
        className={`fixed right-0 top-0 z-100 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">Your cart</h2>
          <button
            onClick={close}
            aria-label="Close cart"
            className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-surface-sunken"
          >
            <X size={20} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <ShoppingBagOpen size={40} weight="thin" className="text-ink-faint" />
            <p className="text-sm text-ink-muted">Your cart is empty.</p>
            <Button variant="ghost" size="sm" onClick={close}>
              Continue shopping
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-border px-5">
              {lines.map((line) => (
                <li key={line.productId} className="flex gap-3 py-4">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-ink-faint">{line.brandName}</p>
                    <Link
                      href={`/products/${line.slug}`}
                      onClick={close}
                      className="focus-ring text-sm font-medium text-ink hover:text-blue-700"
                    >
                      {line.name}
                    </Link>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        aria-label={`Decrease quantity of ${line.name}`}
                        onClick={() => setQuantity(line.productId, line.quantity - 1)}
                        className="focus-ring flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-border-strong hover:bg-surface-sunken"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="tabular w-6 text-center text-sm">{line.quantity}</span>
                      <button
                        aria-label={`Increase quantity of ${line.name}`}
                        onClick={() => setQuantity(line.productId, line.quantity + 1)}
                        className="focus-ring flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-border-strong hover:bg-surface-sunken"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(line.productId)}
                        className="focus-ring ml-2 cursor-pointer text-xs text-ink-faint underline-offset-2 hover:text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="tabular text-sm font-medium text-ink">
                    {formatPKR(line.price * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="border-t border-border px-5 py-4">
              <div className="mb-1 flex items-center justify-between text-sm text-ink-muted">
                <span>Subtotal</span>
                <span className="tabular">{formatPKR(total)}</span>
              </div>
              <p className="mb-4 text-xs text-ink-faint">Shipping and any duties calculated at checkout.</p>
              <LinkButton href="/checkout" size="lg" className="w-full" onClick={close}>
                Checkout
              </LinkButton>
              <LinkButton href="/cart" variant="ghost" size="md" className="mt-2 w-full" onClick={close}>
                View full cart
              </LinkButton>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
