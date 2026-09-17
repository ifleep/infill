import {
  Printer,
  Drop,
  Package,
  Wrench,
  Cube,
  Lightning,
  SunDim,
  Robot,
} from "@phosphor-icons/react/ssr";
import type { IconProps } from "@phosphor-icons/react";
import type { Product } from "@/lib/types";

function renderIcon(product: Product, props: IconProps) {
  if (product.category === "resin") return <Drop {...props} />;
  if (product.category === "filament") return <Package {...props} />;
  if (product.category === "parts") return <Wrench {...props} />;
  if (product.category === "machines") {
    if (product.machineCategory === "cnc") return <Cube {...props} />;
    if (product.machineCategory === "laser") return <Lightning {...props} />;
    if (product.machineCategory === "uv-printing") return <SunDim {...props} />;
    if (product.machineCategory === "robots") return <Robot {...props} />;
    return <Cube {...props} />;
  }
  if (product.technology === "Resin") return <Drop {...props} />;
  return <Printer {...props} />;
}

// Deterministic pseudo-random angle/scale from the product id, so each card
// reads as distinct without any external imagery.
function hashSeed(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

const gradients = [
  "from-blue-700 to-blue-900",
  "from-navy-800 to-blue-900",
  "from-blue-600 to-navy-900",
];

export function ProductVisual({
  product,
  className,
  eager = false,
}: {
  product: Product;
  className?: string;
  /** Set true when this is the largest-contentful-paint candidate (e.g. the
   * imageless fallback standing in for the main product-page gallery) —
   * everywhere else (product-card grids) this should stay lazy. */
  eager?: boolean;
}) {
  const seed = hashSeed(product.id);
  const gradient = gradients[seed % gradients.length];
  const rotate = (seed % 12) - 6;

  if (product.images.length > 0) {
    return (
      <div className={`aspect-square overflow-hidden rounded-xl bg-surface-sunken ${className ?? ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-linear-to-br ${gradient} ${className ?? ""}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />
      {renderIcon(product, {
        size: 72,
        weight: "thin",
        color: "white",
        style: { transform: `rotate(${rotate}deg)` },
        className: "relative opacity-90",
      })}
    </div>
  );
}
