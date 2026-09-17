import type { Product } from "@/lib/types";

/** "N sold" social proof — an admin-set number, not derived from real orders. */
export function SoldCount({ product, className = "" }: { product: Product; className?: string }) {
  if (!product.soldCount) return null;

  return <p className={`text-xs text-ink-muted ${className}`}>{product.soldCount} sold</p>;
}
