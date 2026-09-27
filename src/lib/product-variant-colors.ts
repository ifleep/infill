import type { Product } from "@/lib/types";

// Circular color swatches (see AddToCartPanel) only make sense for products
// sold by color — filament, resin, and parts/accessories. Printer variants
// are configurations (e.g. "Standard" vs "Combo"), not colors, so they keep
// the plain text-button selector.
export const COLOR_VARIANT_CATEGORIES: Product["category"][] = ["filament", "resin", "parts"];

export function categoryUsesColorVariants(category: Product["category"]): boolean {
  return COLOR_VARIANT_CATEGORIES.includes(category);
}
