import Link from "next/link";
import { X, Check } from "@phosphor-icons/react/ssr";
import type { Product } from "@/lib/types";
import { brands } from "@/lib/data/brands";

export interface ActiveFilters {
  tech?: string;
  level?: string;
  use?: string;
  brand?: string;
  sub?: string;
}

function buildHref(base: string, current: ActiveFilters, key: keyof ActiveFilters, value: string) {
  const params = new URLSearchParams();
  const next = { ...current };
  if (next[key] === value) {
    delete next[key];
  } else {
    next[key] = value;
  }
  for (const [k, v] of Object.entries(next)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

function FilterGroup({
  heading,
  base,
  current,
  filterKey,
  options,
}: {
  heading: string;
  base: string;
  current: ActiveFilters;
  filterKey: keyof ActiveFilters;
  options: { label: string; value: string }[];
}) {
  if (options.length === 0) return null;
  return (
    <div className="border-b border-border py-5 first:pt-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">{heading}</p>
      <ul className="space-y-2">
        {options.map((opt) => {
          const active = current[filterKey] === opt.value;
          return (
            <li key={opt.value}>
              <Link
                href={buildHref(base, current, filterKey, opt.value)}
                className={`focus-ring flex cursor-pointer items-center gap-2 text-sm ${
                  active ? "font-semibold text-blue-700" : "text-ink-muted hover:text-ink"
                }`}
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                    active ? "border-blue-700 bg-blue-700" : "border-border-strong"
                  }`}
                >
                  {active && <Check size={10} weight="bold" className="text-white" />}
                </span>
                {opt.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CategoryFilters({
  base,
  current,
  productsInCategory,
  showPrinterFacets,
}: {
  base: string;
  current: ActiveFilters;
  productsInCategory: Product[];
  showPrinterFacets: boolean;
}) {
  const brandOptions = brands
    .filter((b) => productsInCategory.some((p) => p.brandId === b.id))
    .map((b) => ({ label: b.name, value: b.slug }));

  const subOptions = Array.from(new Set(productsInCategory.map((p) => p.subcategory))).map((s) => ({
    label: s,
    value: s,
  }));

  const techOptions = Array.from(
    new Set(productsInCategory.map((p) => p.technology).filter((t): t is NonNullable<typeof t> => Boolean(t)))
  ).map((t) => ({ label: t, value: t }));

  const levelOptions = ["Beginner", "Intermediate", "Professional", "Industrial"].map((l) => ({
    label: l,
    value: l,
  }));
  const useOptions = ["Hobby", "Engineering", "Prototyping", "Education", "Business", "Industrial"].map((u) => ({
    label: u,
    value: u,
  }));

  const hasActive = Object.values(current).some(Boolean);

  return (
    <aside className="w-full shrink-0 lg:w-56">
      {hasActive && (
        <Link
          href={base}
          className="focus-ring mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-600"
        >
          <X size={14} /> Clear all filters
        </Link>
      )}
      {showPrinterFacets && techOptions.length > 0 && (
        <FilterGroup heading="Technology" base={base} current={current} filterKey="tech" options={techOptions} />
      )}
      {!showPrinterFacets && (
        <FilterGroup heading="Type" base={base} current={current} filterKey="sub" options={subOptions} />
      )}
      <FilterGroup heading="Brand" base={base} current={current} filterKey="brand" options={brandOptions} />
      {showPrinterFacets && (
        <>
          <FilterGroup heading="Experience" base={base} current={current} filterKey="level" options={levelOptions} />
          <FilterGroup heading="Use case" base={base} current={current} filterKey="use" options={useOptions} />
        </>
      )}
    </aside>
  );
}
