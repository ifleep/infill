"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PencilSimple, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import type { Brand, Product } from "@/lib/types";

type RowStatus = "idle" | "saving" | "saved" | "error";

function stockStatus(product: Product): { label: string; className: string } {
  if (product.stock <= 0) return { label: "Out of stock", className: "bg-destructive-tint text-destructive" };
  if (product.lowStockThreshold && product.stock <= product.lowStockThreshold) {
    return { label: "Low stock", className: "bg-amber-100 text-amber-800" };
  }
  return { label: "In stock", className: "bg-pk-green-tint text-pk-green" };
}

export function InventoryTable({ initialProducts, brands }: { initialProducts: Product[]; brands: Brand[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [status, setStatus] = useState<Record<string, RowStatus>>({});
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const brandName = (id: string) => brands.find((b) => b.id === id)?.name ?? id;

  const visible = useMemo(() => {
    if (!lowStockOnly) return products;
    return products.filter((p) => p.stock <= 0 || (p.lowStockThreshold && p.stock <= p.lowStockThreshold));
  }, [products, lowStockOnly]);

  function updateLocal(id: string, patch: Partial<Product>) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  async function save(id: string, patch: { stock?: number; lowStockThreshold?: number | null }) {
    setStatus((s) => ({ ...s, [id]: "saving" }));
    try {
      const res = await fetch(`/api/admin/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setStatus((s) => ({ ...s, [id]: "saved" }));
      setTimeout(() => setStatus((s) => ({ ...s, [id]: "idle" })), 1500);
    } catch {
      setStatus((s) => ({ ...s, [id]: "error" }));
    }
  }

  return (
    <div>
      <label className="mb-4 flex w-fit items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={lowStockOnly}
          onChange={(e) => setLowStockOnly(e.target.checked)}
          className="h-4 w-4"
        />
        Low stock &amp; out-of-stock only
      </label>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Low-stock threshold</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((p) => {
              const rowStatus = status[p.id] ?? "idle";
              const s = stockStatus(p);
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-ink-faint">
                      {brandName(p.brandId)} · {p.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      value={p.stock}
                      onChange={(e) => updateLocal(p.id, { stock: Number(e.target.value) })}
                      onBlur={() => save(p.id, { stock: p.stock })}
                      className="focus-ring tabular w-20 rounded border border-border-strong px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={1}
                      placeholder="—"
                      value={p.lowStockThreshold ?? ""}
                      onChange={(e) =>
                        updateLocal(p.id, {
                          lowStockThreshold: e.target.value === "" ? undefined : Number(e.target.value),
                        })
                      }
                      onBlur={() => save(p.id, { lowStockThreshold: p.lowStockThreshold ?? null })}
                      className="focus-ring tabular w-20 rounded border border-border-strong px-2 py-1 placeholder:text-ink-faint"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}>{s.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {rowStatus === "saving" && <span className="text-xs text-ink-faint">Saving…</span>}
                      {rowStatus === "saved" && <CheckCircle size={16} weight="fill" className="text-pk-green" />}
                      {rowStatus === "error" && <WarningCircle size={16} weight="fill" className="text-destructive" />}
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        aria-label={`Edit ${p.name}`}
                        className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-surface-sunken"
                      >
                        <PencilSimple size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-faint">
                  {lowStockOnly ? "Nothing is low on stock." : "No products yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
