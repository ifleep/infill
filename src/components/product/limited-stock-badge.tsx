import type { Product } from "@/lib/types";

/** "Only N left!" urgency messaging — an admin-set number, independent of the real `stock` count. */
export function LimitedStockBadge({ product, className = "" }: { product: Product; className?: string }) {
  if (!product.limitedStockEnabled || !product.limitedStockQuantity) return null;

  return (
    <p className={`text-xs font-medium text-destructive ${className}`}>
      Only {product.limitedStockQuantity} left!
    </p>
  );
}
