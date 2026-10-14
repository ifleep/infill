"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilSimple, Trash, Copy, Eye, EyeSlash, CheckCircle, WarningCircle, CaretUp, CaretDown } from "@phosphor-icons/react";
import type { Availability, Brand, Product } from "@/lib/types";

type RowStatus = "idle" | "saving" | "saved" | "error";
type SortField = "name" | "category" | "price" | "stock" | "availability";
type Sort = { field: SortField; direction: "asc" | "desc" };

const categoryLabels: Record<Product["category"], string> = {
  printers: "3D Printer",
  filament: "Filament",
  resin: "Resin",
  parts: "Parts",
  machines: "Machine",
};

// in-stock/preorder are both purchasable right now (preorder just has a
// wait); out-of-stock isn't, so it always sorts last regardless of direction.
const availabilityRank: Record<string, number> = { "in-stock": 0, preorder: 1, "out-of-stock": 2 };

function SortableHeader({
  field,
  label,
  sort,
  onToggle,
}: {
  field: SortField;
  label: string;
  sort: Sort | null;
  onToggle: (field: SortField) => void;
}) {
  const active = sort?.field === field;
  return (
    <button
      type="button"
      onClick={() => onToggle(field)}
      className="focus-ring flex cursor-pointer items-center gap-1 font-medium uppercase tracking-wide text-ink-faint hover:text-ink"
    >
      {label}
      <span className="flex flex-col">
        <CaretUp size={8} weight="bold" className={active && sort.direction === "asc" ? "text-ink" : "text-ink-faint"} />
        <CaretDown size={8} weight="bold" className={active && sort.direction === "desc" ? "text-ink" : "text-ink-faint"} />
      </span>
    </button>
  );
}

export function AdminProductTable({
  initialProducts,
  brands,
}: {
  initialProducts: Product[];
  brands: Brand[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [status, setStatus] = useState<Record<string, RowStatus>>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort | null>(null);
  const brandName = (id: string) => brands.find((b) => b.id === id)?.name ?? id;

  function toggleSort(field: SortField) {
    setSort((prev) => (prev?.field === field ? { field, direction: prev.direction === "asc" ? "desc" : "asc" } : { field, direction: "asc" }));
  }

  const displayProducts =
    sort === null
      ? products
      : [...products].sort((a, b) => {
          let cmp = 0;
          switch (sort.field) {
            case "name":
              cmp = a.name.localeCompare(b.name);
              break;
            case "category":
              cmp = categoryLabels[a.category].localeCompare(categoryLabels[b.category]);
              break;
            case "price":
              cmp = a.price - b.price;
              break;
            case "stock":
              cmp = a.stock - b.stock;
              break;
            case "availability":
              cmp = availabilityRank[a.availability] - availabilityRank[b.availability];
              break;
          }
          return sort.direction === "asc" ? cmp : -cmp;
        });

  async function save(product: Product) {
    setStatus((s) => ({ ...s, [product.id]: "saving" }));
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: product.slug,
          name: product.name,
          brandId: product.brandId,
          category: product.category,
          subcategory: product.subcategory,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? null,
          stock: product.stock,
          availability: product.availability,
          quoteOnly: product.quoteOnly ?? false,
          shortDescription: product.shortDescription,
          description: product.description,
          featured: product.featured ?? false,
          hidden: product.hidden ?? false,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus((s) => ({ ...s, [product.id]: "saved" }));
      setTimeout(() => setStatus((s) => ({ ...s, [product.id]: "idle" })), 1500);
    } catch {
      setStatus((s) => ({ ...s, [product.id]: "error" }));
    }
  }

  function updateLocal(id: string, patch: Partial<Product>) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  async function handleDuplicate(product: Product) {
    setDuplicating(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error();
      const created = (await res.json()) as Product;
      router.push(`/admin/products/${created.id}/edit`);
    } catch {
      alert("Failed to duplicate product.");
      setDuplicating(null);
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch {
      alert("Failed to delete product.");
    } finally {
      setDeleting(null);
    }
  }

  function toggleHidden(product: Product) {
    const hidden = !(product.hidden ?? false);
    updateLocal(product.id, { hidden });
    save({ ...product, hidden });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-ink-faint">
            <th className="px-4 py-3 font-medium">
              <SortableHeader field="name" label="Product" sort={sort} onToggle={toggleSort} />
            </th>
            <th className="px-4 py-3 font-medium">
              <SortableHeader field="category" label="Category" sort={sort} onToggle={toggleSort} />
            </th>
            <th className="px-4 py-3 font-medium">
              <SortableHeader field="price" label="Price (PKR)" sort={sort} onToggle={toggleSort} />
            </th>
            <th className="px-4 py-3 font-medium">Sale Price</th>
            <th className="px-4 py-3 font-medium">
              <SortableHeader field="stock" label="Stock" sort={sort} onToggle={toggleSort} />
            </th>
            <th className="px-4 py-3 font-medium">
              <SortableHeader field="availability" label="Availability" sort={sort} onToggle={toggleSort} />
            </th>
            <th className="px-4 py-3 font-medium">Featured</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {displayProducts.map((p) => {
            const rowStatus = status[p.id] ?? "idle";
            return (
              <tr key={p.id} className={p.hidden ? "bg-surface-sunken/50" : undefined}>
                <td className="px-4 py-3">
                  <p className="flex items-center gap-2 font-medium text-ink">
                    {p.name}
                    {p.hidden && (
                      <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Hidden
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {brandName(p.brandId)} · {p.slug}
                  </p>
                </td>
                <td className="px-4 py-3 text-ink-muted">{categoryLabels[p.category]}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    value={p.price}
                    onChange={(e) => updateLocal(p.id, { price: Number(e.target.value) })}
                    onBlur={() => save(products.find((x) => x.id === p.id)!)}
                    className="focus-ring tabular w-24 rounded border border-border-strong px-2 py-1"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    placeholder="—"
                    value={p.compareAtPrice ?? ""}
                    onChange={(e) =>
                      updateLocal(p.id, {
                        compareAtPrice: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    onBlur={() => save(products.find((x) => x.id === p.id)!)}
                    className="focus-ring tabular w-24 rounded border border-border-strong px-2 py-1 placeholder:text-ink-faint"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    value={p.stock}
                    onChange={(e) => updateLocal(p.id, { stock: Number(e.target.value) })}
                    onBlur={() => save(products.find((x) => x.id === p.id)!)}
                    className="focus-ring tabular w-20 rounded border border-border-strong px-2 py-1"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={p.availability}
                    onChange={(e) => {
                      const availability = e.target.value as Availability;
                      updateLocal(p.id, { availability });
                      save({ ...p, availability });
                    }}
                    className="select-arrow focus-ring rounded border border-border-strong py-1 pl-2"
                  >
                    <option value="in-stock">In stock</option>
                    <option value="out-of-stock">Out of stock</option>
                    <option value="preorder">Preorder</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={p.featured ?? false}
                    onChange={(e) => {
                      const featured = e.target.checked;
                      updateLocal(p.id, { featured });
                      save({ ...p, featured });
                    }}
                    className="h-4 w-4"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {rowStatus === "saving" && <span className="text-xs text-ink-faint">Saving…</span>}
                    {rowStatus === "saved" && <CheckCircle size={16} weight="fill" className="text-pk-green" />}
                    {rowStatus === "error" && (
                      <WarningCircle size={16} weight="fill" className="text-destructive" />
                    )}
                    <button
                      onClick={() => toggleHidden(p)}
                      aria-label={p.hidden ? `Unhide ${p.name}` : `Hide ${p.name}`}
                      title={
                        p.hidden
                          ? "Hidden — pulled from every public page, direct link included. Click to show again."
                          : "Visible on the site. Click to hide — admin keeps seeing it regardless."
                      }
                      className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-surface-sunken"
                    >
                      {p.hidden ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      aria-label={`Edit ${p.name}`}
                      className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-surface-sunken"
                    >
                      <PencilSimple size={16} />
                    </Link>
                    <button
                      onClick={() => handleDuplicate(p)}
                      disabled={duplicating === p.id}
                      aria-label={`Duplicate ${p.name}`}
                      title="Duplicate"
                      className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deleting === p.id}
                      aria-label={`Delete ${p.name}`}
                      className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-destructive-tint hover:text-destructive"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
