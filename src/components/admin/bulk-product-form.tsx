"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, WarningCircle, Circle } from "@phosphor-icons/react";
import type { Brand, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { parseBulkProductText, type ParsedBulkBlock } from "@/lib/admin/parse-product-text";
import { emptyProductFormValues, fromProduct, type ProductFormValues } from "@/components/admin/product-form";

type ItemStatus = "pending" | "not-found" | "creating" | "created" | "error";
type Mode = "create" | "edit";

/** Shape of GET /api/admin/products/{id} — see getProductAdminById in src/lib/data/products.ts. */
interface AdminProductDetail extends Product {
  preorderLeadDaysOverride: number | null;
}

interface BulkItem {
  block: ParsedBulkBlock;
  status: ItemStatus;
  error?: string;
  productId?: string;
  /** Edit mode only — the product's current full record, fetched at parse time so fields the paste leaves out keep their live value instead of being blanked. */
  existing?: AdminProductDetail;
}

function buildBody(item: BulkItem, mode: Mode) {
  const { block, existing } = item;

  if (mode === "edit" && existing) {
    // Required fields (price, stock, availability, description, ...) have
    // to be sent on every PATCH, so start from the product's current
    // values and overlay only what the pasted block actually specified —
    // same merge behavior as the single edit form's paste box.
    const base = fromProduct(existing, existing.preorderLeadDaysOverride);
    const values: ProductFormValues = { ...base, ...block.values };
    const body: Record<string, unknown> = {
      ...values,
      categoryId: values.categoryId || null,
      price: values.price === "" ? 0 : values.price,
      compareAtPrice: values.compareAtPrice === "" ? null : values.compareAtPrice,
      stock: values.stock === "" ? 0 : values.stock,
      lowStockThreshold: values.lowStockThreshold === "" ? null : values.lowStockThreshold,
      preorderLeadDays: values.preorderLeadDays === "" ? null : values.preorderLeadDays,
      weightKg: values.weightKg === "" ? null : values.weightKg,
      warrantyMonths: values.warrantyMonths === "" ? 0 : values.warrantyMonths,
      soldCount: values.soldCount === "" ? 0 : values.soldCount,
      saleEndsAt: values.saleEndsAt === "" ? null : new Date(values.saleEndsAt as string).toISOString(),
      limitedStockQuantity: values.limitedStockQuantity === "" ? null : values.limitedStockQuantity,
    };
    // Photos, content blocks and variants are the opposite: PATCH treats a
    // field left OUT of the JSON body as "leave this untouched" (see
    // ProductInput.mediaIds/contentBlocks/variants in src/lib/data/products.ts).
    // The paste format has no way to specify photos at all, so mediaIds is
    // never sent here. contentBlocks/variants are included only when the
    // block actually had a Specifications:/Variants: section.
    if (block.contentBlocks) body.contentBlocks = block.contentBlocks;
    if (block.variants) {
      body.variants = block.variants.map((v) => ({
        id: v.id,
        label: v.label,
        price: v.price === "" ? 0 : v.price,
        compareAtPrice: v.compareAtPrice === "" ? null : v.compareAtPrice,
        stock: v.stock === "" ? 0 : v.stock,
        sku: v.sku || null,
        availability: v.availability,
        isDefault: v.isDefault,
        colorHex: v.colorHex || null,
        imageUrl: v.imageUrl || null,
      }));
    }
    return body;
  }

  const values: Partial<ProductFormValues> = { ...emptyProductFormValues, ...block.values };
  return {
    ...values,
    categoryId: values.categoryId || null,
    price: values.price === "" ? 0 : values.price,
    compareAtPrice: values.compareAtPrice === "" ? null : values.compareAtPrice,
    stock: values.stock === "" ? 0 : values.stock,
    lowStockThreshold: values.lowStockThreshold === "" ? null : values.lowStockThreshold,
    preorderLeadDays: values.preorderLeadDays === "" ? null : values.preorderLeadDays,
    weightKg: values.weightKg === "" ? null : values.weightKg,
    warrantyMonths: values.warrantyMonths === "" ? 0 : values.warrantyMonths,
    soldCount: values.soldCount === "" ? 0 : values.soldCount,
    saleEndsAt: values.saleEndsAt === "" ? null : new Date(values.saleEndsAt as string).toISOString(),
    limitedStockQuantity: values.limitedStockQuantity === "" ? null : values.limitedStockQuantity,
    mediaIds: [],
    contentBlocks: block.contentBlocks ?? [],
    variants: (block.variants ?? []).map((v) => ({
      id: v.id,
      label: v.label,
      price: v.price === "" ? 0 : v.price,
      compareAtPrice: v.compareAtPrice === "" ? null : v.compareAtPrice,
      stock: v.stock === "" ? 0 : v.stock,
      sku: v.sku || null,
      availability: v.availability,
      isDefault: v.isDefault,
      colorHex: v.colorHex || null,
      imageUrl: v.imageUrl || null,
    })),
  };
}

/**
 * Same "Label: value" paste format as the single-product Add Product form,
 * just several products separated by a line of "===". Each block is parsed
 * with the identical parseProductText the single form uses.
 *
 * Two modes:
 * - Create: each block becomes a new product via POST /api/admin/products
 *   (errors if a slug already exists — same rule as the single form).
 * - Edit: each block's Slug is matched against your existing products
 *   (fetched once at parse time, along with each matched product's full
 *   current record) and updates that product via PATCH
 *   /api/admin/products/{id} — a block whose slug doesn't match anything
 *   live is left alone and clearly marked "not found," never silently
 *   created. Fields left out of a block — including photos, content
 *   blocks and variants — keep their current live value, same merge
 *   behavior as the single edit form's paste box.
 */
export function BulkProductForm({ brands }: { brands: Brand[] }) {
  const [mode, setMode] = useState<Mode>("create");
  const [pasteText, setPasteText] = useState("");
  const [items, setItems] = useState<BulkItem[] | null>(null);
  const [parsing, setParsing] = useState(false);
  const [working, setWorking] = useState(false);

  async function handleParse() {
    const blocks = parseBulkProductText(pasteText, brands);

    if (mode === "create") {
      setItems(blocks.map((block) => ({ block, status: "pending" as const })));
      return;
    }

    setParsing(true);
    try {
      // Edit mode: resolve each block's slug against the live catalog once,
      // up front, so "not found" shows before anything is attempted.
      const res = await fetch("/api/admin/products");
      const existingList: { id: string; slug: string }[] = res.ok ? await res.json().catch(() => []) : [];
      const bySlug = new Map(existingList.map((p) => [p.slug, p.id]));

      const resolved = await Promise.all(
        blocks.map(async (block): Promise<BulkItem> => {
          const slug = block.values.slug;
          const productId = slug ? bySlug.get(slug) : undefined;
          if (!productId) return { block, status: "not-found" };

          // Fetch the full current record now — this is the baseline every
          // omitted field in the paste falls back to, so it has to reflect
          // what's live right now, not a stale snapshot.
          const detailRes = await fetch(`/api/admin/products/${productId}`);
          if (!detailRes.ok) return { block, status: "not-found" };
          const existing: AdminProductDetail = await detailRes.json();
          return { block, status: "pending", productId, existing };
        })
      );

      setItems(resolved);
    } finally {
      setParsing(false);
    }
  }

  async function handleApplyAll() {
    if (!items) return;
    setWorking(true);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === "created" || item.status === "not-found") continue; // nothing to retry

      setItems((prev) => prev!.map((it, idx) => (idx === i ? { ...it, status: "creating" } : it)));

      const body = buildBody(item, mode);
      const url = mode === "edit" ? `/api/admin/products/${item.productId}` : "/api/admin/products";
      const method = mode === "edit" ? "PATCH" : "POST";

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setItems((prev) =>
            prev!.map((it, idx) => (idx === i ? { ...it, status: "error", error: data.error ?? "Failed." } : it))
          );
        } else {
          setItems((prev) =>
            prev!.map((it, idx) => (idx === i ? { ...it, status: "created", productId: data.id } : it))
          );
        }
      } catch {
        setItems((prev) =>
          prev!.map((it, idx) => (idx === i ? { ...it, status: "error", error: "Network error." } : it))
        );
      }
    }

    setWorking(false);
  }

  const doneCount = items?.filter((i) => i.status === "created").length ?? 0;
  const errorCount = items?.filter((i) => i.status === "error").length ?? 0;
  const notFoundCount = items?.filter((i) => i.status === "not-found").length ?? 0;
  const allDone = items !== null && items.every((i) => i.status === "created" || i.status === "error" || i.status === "not-found");

  return (
    <div className="max-w-4xl space-y-5">
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("create");
              setItems(null);
            }}
            className={`focus-ring cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium ${
              mode === "create" ? "border-blue-700 bg-blue-50 text-blue-700" : "border-border-strong text-ink-muted hover:bg-surface-sunken"
            }`}
          >
            Create new products
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("edit");
              setItems(null);
            }}
            className={`focus-ring cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium ${
              mode === "edit" ? "border-blue-700 bg-blue-50 text-blue-700" : "border-border-strong text-ink-muted hover:bg-surface-sunken"
            }`}
          >
            Update existing products
          </button>
        </div>
        <p className="text-sm text-ink-muted">
          {mode === "create"
            ? "Paste several products in one go, separated by a line containing only "
            : "Paste corrected blocks for products that already exist — matched by their URL slug, so each block's Slug must exactly match the live product's slug. Fields left out of a block — including photos, content blocks and variants — keep their current value. Separate products with a line containing only "}
          <code>===</code>. Each block uses the exact same &ldquo;Label: value&rdquo; format as the single Add
          Product paste box, including optional <code>Specifications:</code> and <code>Variants:</code> sections.
        </p>
        <textarea
          rows={14}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={
            "Name: A1 Mini (CN Variant)\nBrand: Bambu Lab\nCategory: printers\n...\n\n===\n\nName: A2L (CN Variant)\nBrand: Bambu Lab\n..."
          }
          className="mt-3 w-full rounded-md border border-border-strong px-3 py-2 font-mono text-xs focus-ring"
        />
        <div className="mt-3 flex items-center gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={handleParse} disabled={!pasteText.trim() || parsing}>
            {parsing ? "Matching…" : "Parse All"}
          </Button>
          {items && (
            <span className="text-sm text-ink-muted">
              {items.length} product{items.length === 1 ? "" : "s"} detected
              {mode === "edit" && notFoundCount > 0 && `, ${notFoundCount} not found on your site`}
            </span>
          )}
        </div>
      </div>

      {items && items.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Preview</h2>
            <Button type="button" onClick={handleApplyAll} disabled={working || allDone}>
              {working ? "Working…" : allDone ? "Done" : mode === "edit" ? "Update All" : "Create All"}
            </Button>
          </div>

          {allDone && (
            <p className="mb-4 text-sm text-ink-muted">
              {doneCount} of {items.length} {mode === "edit" ? "updated" : "created"} successfully.
              {errorCount > 0 && ` ${errorCount} failed — fix the text below and click ${mode === "edit" ? "Update" : "Create"} All again.`}
              {notFoundCount > 0 && ` ${notFoundCount} skipped — slug not found on your site.`}
            </p>
          )}

          <ul className="divide-y divide-border">
            {items.map((item, i) => {
              const name = item.block.values.name || "(no name found)";
              const brandName = brands.find((b) => b.id === item.block.values.brandId)?.name;
              return (
                <li key={i} className="py-3">
                  <div className="flex items-center gap-3">
                    {item.status === "pending" && <Circle size={16} className="shrink-0 text-ink-faint" />}
                    {item.status === "not-found" && (
                      <WarningCircle size={16} weight="fill" className="shrink-0 text-amber-600" />
                    )}
                    {item.status === "creating" && (
                      <span className="tabular shrink-0 text-xs text-ink-faint">
                        {mode === "edit" ? "Updating…" : "Creating…"}
                      </span>
                    )}
                    {item.status === "created" && (
                      <CheckCircle size={16} weight="fill" className="shrink-0 text-pk-green" />
                    )}
                    {item.status === "error" && (
                      <WarningCircle size={16} weight="fill" className="shrink-0 text-destructive" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">
                        {name}
                        {brandName && <span className="text-ink-faint"> · {brandName}</span>}
                        {item.block.values.price !== undefined && item.block.values.price !== "" && (
                          <span className="tabular text-ink-faint"> · PKR {item.block.values.price}</span>
                        )}
                        {item.block.values.slug && (
                          <span className="text-ink-faint"> · {item.block.values.slug}</span>
                        )}
                      </p>
                      {item.status === "not-found" && (
                        <p className="text-xs text-amber-700">
                          No product with this slug exists — skipped. Check the slug, or use Create mode instead.
                        </p>
                      )}
                      {item.status === "created" && item.productId && (
                        <Link
                          href={`/admin/products/${item.productId}/edit`}
                          className="focus-ring text-xs text-blue-700 hover:text-blue-600"
                        >
                          {mode === "edit" ? "View this product →" : "Edit this product →"}
                        </Link>
                      )}
                      {item.status === "error" && (
                        <p className="text-xs text-destructive">{item.error}</p>
                      )}
                      {item.block.warnings.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {item.block.warnings.map((w, wi) => (
                            <li key={wi} className="text-xs text-amber-700">
                              {w}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
