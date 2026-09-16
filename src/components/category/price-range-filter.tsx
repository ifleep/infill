"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPKR } from "@/lib/format";

/**
 * A dual-handle price slider — two overlapping native range inputs (see
 * globals.css's .price-range-thumb for the CSS trick that hides the track
 * and leaves only each thumb visible/interactive). Commits to the URL
 * (merged with whatever other filters are already active) on release
 * rather than on every drag tick, so it doesn't spam navigations while
 * dragging — same shareable/bookmarkable ?query= pattern the rest of the
 * category filters already use.
 */
export function PriceRangeFilter({
  base,
  otherParams,
  min,
  max,
  currentMin,
  currentMax,
}: {
  base: string;
  otherParams: string;
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
}) {
  const router = useRouter();
  const [range, setRange] = useState<[number, number]>([currentMin, currentMax]);

  if (min >= max) return null;

  function commit(next: [number, number]) {
    const params = new URLSearchParams(otherParams);
    if (next[0] > min) params.set("priceMin", String(next[0]));
    else params.delete("priceMin");
    if (next[1] < max) params.set("priceMax", String(next[1]));
    else params.delete("priceMax");
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base, { scroll: false });
  }

  const lowPercent = ((range[0] - min) / (max - min)) * 100;
  const highPercent = ((range[1] - min) / (max - min)) * 100;

  return (
    <div className="border-b border-border py-5 first:pt-0">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-faint">Price</p>
      <div className="relative h-4">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-border-strong" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-blue-700"
          style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={range[0]}
          onChange={(e) => setRange([Math.min(Number(e.target.value), range[1]), range[1]])}
          onMouseUp={() => commit(range)}
          onTouchEnd={() => commit(range)}
          onKeyUp={() => commit(range)}
          aria-label="Minimum price"
          className="price-range-thumb absolute inset-x-0 top-1/2 h-1.5 w-full -translate-y-1/2 cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={range[1]}
          onChange={(e) => setRange([range[0], Math.max(Number(e.target.value), range[0])])}
          onMouseUp={() => commit(range)}
          onTouchEnd={() => commit(range)}
          onKeyUp={() => commit(range)}
          aria-label="Maximum price"
          className="price-range-thumb absolute inset-x-0 top-1/2 h-1.5 w-full -translate-y-1/2 cursor-pointer"
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
        <span>{formatPKR(range[0])}</span>
        <span>{formatPKR(range[1])}</span>
      </div>
    </div>
  );
}
