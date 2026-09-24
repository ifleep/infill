import type { Product } from "@/lib/types";

/**
 * "N sold" social proof. Increments automatically when an order is placed
 * (see createOrder in lib/data/orders.ts) — an admin can still nudge it
 * manually from the product edit page (e.g. to reflect sales made before
 * this site existed), but from here on it's a real running total, not a
 * static number. Always renders, including "0 sold", so every product
 * card shows the same set of badge lines regardless of sales history.
 */
export function SoldCount({ product, className = "" }: { product: Product; className?: string }) {
  return <p className={`text-xs text-ink-muted ${className}`}>{product.soldCount ?? 0} sold</p>;
}
