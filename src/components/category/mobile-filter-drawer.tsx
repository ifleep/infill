"use client";

import { useState, type ReactNode } from "react";
import { FunnelSimple, X } from "@phosphor-icons/react";

/**
 * Phones only (below `sm`, 640px): hides the filter sidebar behind a
 * "Filters" button that opens a slide-over panel, instead of the sidebar
 * dumping itself above the product grid. `sm` and up renders `children`
 * exactly as before (a `hidden sm:block` wrapper, untouched layout) — the
 * mobile panel only mounts while actually open, so there's never more than
 * one live copy of the filters on screen at once.
 */
export function MobileFilterDrawer({ children, hasActiveFilters }: { children: ReactNode; hasActiveFilters: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring mb-6 flex cursor-pointer items-center gap-2 rounded-md border border-border-strong px-4 py-2.5 text-sm font-medium text-ink sm:hidden"
      >
        <FunnelSimple size={16} />
        Filters
        {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-blue-700" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 sm:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-surface p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="focus-ring cursor-pointer rounded p-1 text-ink-faint hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>
            {children}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="focus-ring mt-6 w-full cursor-pointer rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Show results
            </button>
          </div>
        </div>
      )}

      <div className="hidden sm:block">{children}</div>
    </>
  );
}
