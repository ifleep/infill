"use client";

import { useState } from "react";
import type { MediaItem } from "@/lib/admin/media-types";
import { ImportFromUrl } from "@/components/admin/import-from-url";

/**
 * Lightweight picker for a variant's photo — unlike MediaPicker (the full
 * Media Library modal with search/upload/pagination across every photo
 * ever uploaded), this only ever shows the handful of photos already
 * chosen as this product's own photos, so there's nothing to search or
 * scroll through. Click a thumbnail to pick it; no multi-select, no
 * "confirm" step.
 *
 * `allowImport` (filament products only — see product-form.tsx) adds an
 * "Import from URL" tab so a variant's photo can be sourced directly
 * instead of requiring it to already exist in the product's own Photos
 * section first. An imported photo is reported via `onImported` so the
 * caller can both select it and add it to that main Photos section,
 * keeping the two in sync.
 */
export function VariantPhotoPicker({
  open,
  items,
  allowImport = false,
  onSelect,
  onImported,
  onClose,
}: {
  open: boolean;
  items: MediaItem[];
  allowImport?: boolean;
  onSelect: (item: MediaItem) => void;
  onImported?: (items: MediaItem[]) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"library" | "import">("library");

  // Reset to the library tab on close rather than via an effect keyed on
  // `open` — this component stays mounted with open toggling, so resetting
  // here (not next render) is what actually clears the tab before it's
  // shown again for a different variant.
  function handleClose() {
    setMode("library");
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-xl bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-ink">Choose a product photo</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="focus-ring cursor-pointer rounded p-1 text-ink-muted hover:bg-surface-sunken"
          >
            &times;
          </button>
        </div>

        {allowImport && (
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <button
              type="button"
              onClick={() => setMode("library")}
              className={`focus-ring cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium ${
                mode === "library" ? "border-blue-700 bg-blue-50 text-blue-700" : "border-border-strong text-ink-muted hover:bg-surface-sunken"
              }`}
            >
              Library
            </button>
            <button
              type="button"
              onClick={() => setMode("import")}
              className={`focus-ring cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium ${
                mode === "import" ? "border-blue-700 bg-blue-50 text-blue-700" : "border-border-strong text-ink-muted hover:bg-surface-sunken"
              }`}
            >
              Import from URL
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {mode === "import" ? (
            <ImportFromUrl
              onImported={(imported) => {
                onImported?.(imported);
                handleClose();
              }}
            />
          ) : items.length === 0 ? (
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
                    handleClose();
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
            onClick={handleClose}
            className="focus-ring cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-ink-muted hover:bg-surface-sunken"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
