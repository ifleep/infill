"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

export interface PickableProduct {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  price: number;
  image?: string;
}

function toPickable(p: Product): PickableProduct {
  return { id: p.id, name: p.name, slug: p.slug, brandName: p.brandName, price: p.price, image: p.images[0] };
}

/**
 * Modal for choosing other products in the catalog — used for "Related
 * products" and "Accessories" on the product form. Fetches the full
 * catalog once (same GET /api/admin/products the bulk-edit feature's slug
 * matching already uses) and filters client-side, which is fine at this
 * catalog's size and avoids needing a dedicated search endpoint.
 */
export function ProductPicker({
  open,
  onClose,
  onSelect,
  excludeIds,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (items: PickableProduct[]) => void;
  /** Ids to hide from the list — the product being edited itself, plus whatever's already selected. */
  excludeIds: string[];
}) {
  const [all, setAll] = useState<PickableProduct[]>([]);
  const [selected, setSelected] = useState<Record<string, PickableProduct>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // Reset-on-open, same pattern (and same tradeoff) as MediaPicker.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting selection/query when the modal opens, not syncing to a prop
    setSelected({});
    setQuery("");
    setLoading(true);
    setError(null);
    fetch("/api/admin/products")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: Product[]) => setAll(data.map(toPickable)))
      .catch(() => setError("Couldn't load the product list."))
      .finally(() => setLoading(false));
  }, [open]);

  function toggle(item: PickableProduct) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[item.id]) delete next[item.id];
      else next[item.id] = item;
      return next;
    });
  }

  function confirm() {
    onSelect(Object.values(selected));
    onClose();
  }

  if (!open) return null;

  const excludeSet = new Set(excludeIds);
  const q = query.trim().toLowerCase();
  const results = all.filter((p) => {
    if (excludeSet.has(p.id)) return false;
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
  });

  const selectedCount = Object.keys(selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-ink">Choose products</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring cursor-pointer rounded p-1 text-ink-muted hover:bg-surface-sunken"
          >
            &times;
          </button>
        </div>

        <div className="border-b border-border px-5 py-3">
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, brand or slug…"
            className="focus-ring w-full rounded-md border border-border-strong px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint"
          />
        </div>

        {error && <p className="px-5 pt-3 text-sm text-destructive">{error}</p>}

        <div className="flex-1 overflow-y-auto px-5 py-2">
          {loading ? (
            <p className="py-10 text-center text-sm text-ink-faint">Loading…</p>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-faint">No products found.</p>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((p) => {
                const isSelected = Boolean(selected[p.id]);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => toggle(p)}
                      className={`focus-ring flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-surface-sunken ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                    >
                      <span className="block h-10 w-10 shrink-0 overflow-hidden rounded bg-surface-sunken">
                        {p.image && (
                          // eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import
                          <img src={p.image} alt="" className="h-full w-full object-cover" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                        <span className="block truncate text-xs text-ink-faint">
                          {p.brandName} · PKR {p.price.toLocaleString()}
                        </span>
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                          isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-border-strong text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <p className="text-sm text-ink-faint">{selectedCount} selected</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-ink-muted hover:bg-surface-sunken"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={selectedCount === 0}
              className="focus-ring cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add {selectedCount || ""} {selectedCount === 1 ? "product" : "products"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Selected-products list + "Add products" trigger — shared by the Related
 * products and Accessories fields on the product form. Owns nothing; the
 * parent holds the actual selection as state (same pattern as photos/
 * variants/contentBlocks on ProductForm).
 */
export function ProductRelationField({
  label,
  hint,
  items,
  onChange,
  excludeProductId,
}: {
  label: string;
  hint: string;
  items: PickableProduct[];
  onChange: (items: PickableProduct[]) => void;
  excludeProductId?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  function addSelected(picked: PickableProduct[]) {
    const existingIds = new Set(items.map((i) => i.id));
    onChange([...items, ...picked.filter((p) => !existingIds.has(p.id))]);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="focus-ring cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-600"
        >
          + Add products
        </button>
      </div>
      <p className="mt-1 text-xs text-ink-faint">{hint}</p>

      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-md border border-border-strong px-3 py-2"
            >
              <span className="block h-9 w-9 shrink-0 overflow-hidden rounded bg-surface-sunken">
                {p.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import
                  <img src={p.image} alt="" className="h-full w-full object-cover" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                <span className="block truncate text-xs text-ink-faint">
                  {p.brandName} · PKR {p.price.toLocaleString()}
                </span>
              </span>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="focus-ring cursor-pointer rounded p-1 text-xs font-medium text-ink-faint hover:bg-surface-sunken hover:text-destructive"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <ProductPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addSelected}
        excludeIds={[...(excludeProductId ? [excludeProductId] : []), ...items.map((i) => i.id)]}
      />
    </div>
  );
}
