import type { Product } from "@/lib/types";

export function StockUrgency({ product, className = "" }: { product: Product; className?: string }) {
  if (product.availability !== "in-stock" || !product.lowStockThreshold) return null;
  if (product.stock > product.lowStockThreshold) return null;

  return (
    <p className={`text-xs font-medium text-destructive ${className}`}>
      {product.stock <= 0 ? "Almost sold out" : `Only ${product.stock} left in stock`}
    </p>
  );
}
