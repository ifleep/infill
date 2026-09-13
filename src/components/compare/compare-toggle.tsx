"use client";

import { useEffect } from "react";
import { Scales } from "@phosphor-icons/react";
import { useCompareStore } from "@/components/compare/compare-store";

export function CompareToggle({ productId }: { productId: string }) {
  const hydrate = useCompareStore((s) => s.hydrate);
  const ids = useCompareStore((s) => s.ids);
  const toggle = useCompareStore((s) => s.toggle);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const active = ids.includes(productId);

  return (
    <button
      onClick={() => toggle(productId)}
      aria-pressed={active}
      className={`focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3.5 py-2 text-sm font-medium transition-colors ${
        active ? "border-blue-700 bg-blue-50 text-blue-700" : "border-border-strong text-ink hover:bg-surface-sunken"
      }`}
    >
      <Scales size={16} />
      {active ? "Added to Compare" : "Add to Compare"}
    </button>
  );
}
