"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import type { Product } from "@/lib/types";
import { brands, getBrandById } from "@/lib/data/brands";

const suggestions = [
  "3D printers",
  "PLA filament",
  "PETG filament",
  "Bambu Lab",
  "Resin",
  "Nozzles",
  "Build plates",
];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  const [products, setProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  // Clear the query when the overlay transitions to closed — adjusting
  // state during render (rather than in an effect) so it takes effect in
  // the same commit, per React's guidance for resetting state on prop change.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setQuery("");
  }

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const matchedProducts = q
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.subcategory.toLowerCase().includes(q) ||
            getBrandById(p.brandId)?.name.toLowerCase().includes(q)
        )
        .slice(0, 6)
    : [];
  const matchedBrands = q ? brands.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 4) : [];

  return (
    <div className="fixed inset-0 z-110" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden="true" />
      <div className="relative mx-auto mt-0 w-full max-w-3xl bg-surface px-5 pb-8 pt-6 shadow-2xl sm:mt-16 sm:rounded-xl sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <MagnifyingGlass size={22} className="text-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && q) {
                router.push(`/search?q=${encodeURIComponent(query)}`);
                onClose();
              }
            }}
            type="search"
            placeholder="What are you looking for?"
            className="focus-ring w-full border-none bg-transparent text-lg text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-surface-sunken"
          >
            <X size={22} />
          </button>
        </div>

        {!q && (
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="focus-ring cursor-pointer rounded-full border border-border px-3.5 py-1.5 text-sm text-ink hover:border-blue-300 hover:bg-blue-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {q && matchedProducts.length === 0 && matchedBrands.length === 0 && (
          <p className="text-sm text-ink-muted">No matches for &ldquo;{query}&rdquo; yet — try a broader term.</p>
        )}

        {matchedBrands.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">Brands</p>
            <div className="flex flex-wrap gap-2">
              {matchedBrands.map((b) => (
                <Link
                  key={b.id}
                  href={`/category/3d-printers?brand=${b.slug}`}
                  onClick={onClose}
                  className="focus-ring rounded-full bg-surface-sunken px-3.5 py-1.5 text-sm text-ink hover:bg-blue-50"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {matchedProducts.length > 0 && (
          <ul className="divide-y divide-border">
            {matchedProducts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.slug}`}
                  onClick={onClose}
                  className="focus-ring flex items-center justify-between gap-4 py-3 hover:text-blue-700"
                >
                  <span>
                    <span className="block text-sm font-medium text-ink">{p.name}</span>
                    <span className="block text-xs text-ink-faint">{getBrandById(p.brandId)?.name}</span>
                  </span>
                  <span className="text-xs uppercase tracking-wide text-ink-faint">{p.subcategory}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
