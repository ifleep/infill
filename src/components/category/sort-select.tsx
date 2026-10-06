"use client";

import { useRouter } from "next/navigation";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A-Z" },
];

/**
 * Reorders the same already-fetched product list server-side — this only
 * ever changes the `sort` URL param (same shareable/bookmarkable pattern as
 * the rest of category-filters), it doesn't refetch or resort client-side.
 * `otherParams` should already exclude `sort` and `page` — picking a new
 * sort intentionally resets pagination back to page 1.
 */
export function SortSelect({ base, otherParams, current }: { base: string; otherParams: string; current: string }) {
  const router = useRouter();

  function onChange(value: string) {
    const params = new URLSearchParams(otherParams);
    if (value !== "featured") params.set("sort", value);
    else params.delete("sort");
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base, { scroll: false });
  }

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Sort products"
      className="focus-ring cursor-pointer rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm text-ink"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          Sort: {o.label}
        </option>
      ))}
    </select>
  );
}
