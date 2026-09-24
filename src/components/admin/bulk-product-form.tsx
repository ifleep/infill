"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, WarningCircle, Circle } from "@phosphor-icons/react";
import type { Brand } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { parseBulkProductText, type ParsedBulkBlock } from "@/lib/admin/parse-product-text";
import { emptyProductFormValues, type ProductFormValues } from "@/components/admin/product-form";

type ItemStatus = "pending" | "creating" | "created" | "error";

interface BulkItem {
  block: ParsedBulkBlock;
  status: ItemStatus;
  error?: string;
  productId?: string;
}

/**
 * Same "Label: value" paste format as the single-product Add Product form,
 * just several products separated by a line of "===". Each block is parsed
 * with the identical parseProductText the single form uses, and each
 * product is created through the identical POST /api/admin/products the
 * single form uses — this page is only a loop around that, not a second
 * write path with its own rules.
 */
export function BulkProductForm({ brands }: { brands: Brand[] }) {
  const [pasteText, setPasteText] = useState("");
  const [items, setItems] = useState<BulkItem[] | null>(null);
  const [creating, setCreating] = useState(false);

  function handleParse() {
    const blocks = parseBulkProductText(pasteText, brands);
    setItems(blocks.map((block) => ({ block, status: "pending" as const })));
  }

  async function handleCreateAll() {
    if (!items) return;
    setCreating(true);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === "created") continue; // already created on a previous retry

      setItems((prev) => prev!.map((it, idx) => (idx === i ? { ...it, status: "creating" } : it)));

      const values: Partial<ProductFormValues> = { ...emptyProductFormValues, ...item.block.values };
      const body = {
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
        contentBlocks: item.block.contentBlocks,
        variants: (item.block.variants ?? []).map((v) => ({
          id: v.id,
          label: v.label,
          price: v.price === "" ? 0 : v.price,
          compareAtPrice: v.compareAtPrice === "" ? null : v.compareAtPrice,
          stock: v.stock === "" ? 0 : v.stock,
          sku: v.sku || null,
          availability: v.availability,
          isDefault: v.isDefault,
        })),
      };

      try {
        const res = await fetch("/api/admin/products", {
          method: "POST",
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

    setCreating(false);
  }

  const createdCount = items?.filter((i) => i.status === "created").length ?? 0;
  const errorCount = items?.filter((i) => i.status === "error").length ?? 0;
  const allDone = items !== null && items.every((i) => i.status === "created" || i.status === "error");

  return (
    <div className="max-w-4xl space-y-5">
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-ink-muted">
          Paste several products in one go, separated by a line containing only <code>===</code>. Each block
          uses the exact same &ldquo;Label: value&rdquo; format as the single Add Product paste box, including
          optional <code>Specifications:</code> and <code>Variants:</code> sections.
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
          <Button type="button" variant="secondary" size="sm" onClick={handleParse} disabled={!pasteText.trim()}>
            Parse All
          </Button>
          {items && (
            <span className="text-sm text-ink-muted">
              {items.length} product{items.length === 1 ? "" : "s"} detected
            </span>
          )}
        </div>
      </div>

      {items && items.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Preview</h2>
            <Button type="button" onClick={handleCreateAll} disabled={creating || allDone}>
              {creating ? "Creating…" : allDone ? "Done" : "Create All"}
            </Button>
          </div>

          {allDone && (
            <p className="mb-4 text-sm text-ink-muted">
              {createdCount} of {items.length} created successfully.
              {errorCount > 0 && ` ${errorCount} failed — fix the text below and click Create All again.`}
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
                    {item.status === "creating" && (
                      <span className="tabular shrink-0 text-xs text-ink-faint">Creating…</span>
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
                      </p>
                      {item.status === "created" && item.productId && (
                        <Link
                          href={`/admin/products/${item.productId}/edit`}
                          className="focus-ring text-xs text-blue-700 hover:text-blue-600"
                        >
                          Edit this product →
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
