"use client";

import type { MediaItem } from "@/lib/admin/media-types";

/**
 * Lightweight picker for a variant's photo — unlike MediaPicker (the full
 * Media Library modal with search/upload/pagination across every photo
 * ever uploaded), this only ever shows the handful of photos already
 * chosen as this product's own photos, so there's nothing to search or
 * scroll through. Click a thumbnail to pick it; no multi-select, no
 * "confirm" step.
 */
export function VariantPhotoPicker({
  open,
  items,
  onSelect,
  onClose,
}: {
  open: boolean;
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-xl bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-ink">Choose a product photo</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring cursor-pointer rounded p-1 text-ink-muted hover:bg-surface-sunken"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-faint">
              This product has no photos yet — add some in the Photos section above first.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  title={item.filename ?? item.alt ?? undefined}
                  className="focus-ring group relative aspect-square overflow-hidden rounded-md border border-border bg-surface-sunken transition-colors hover:border-border-strong"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- uploaded file, not a static import */}
                  <img src={item.url} alt={item.alt ?? ""} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-ink-muted hover:bg-surface-sunken"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
