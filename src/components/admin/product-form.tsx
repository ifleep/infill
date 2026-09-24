"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Brand, Product, PrinterTechnology, ExperienceLevel, UseCase } from "@/lib/types";
import type { ContentBlock } from "@/lib/content-blocks/types";
import type { MediaItem } from "@/lib/admin/media-types";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ContentBlockEditor } from "@/components/admin/content-block-editor";
import { parseProductText } from "@/lib/admin/parse-product-text";

const categories: { value: Product["category"]; label: string }[] = [
  { value: "printers", label: "3D Printer" },
  { value: "filament", label: "Filament" },
  { value: "resin", label: "Resin" },
  { value: "parts", label: "Parts & Accessories" },
  { value: "machines", label: "Machine (CNC/UV/Laser/Robots)" },
];

// Must match the mega menu's filter links (nav-data.ts) and the 3D Printers
// category page's filter logic (category/[slug]/page.tsx) exactly — these
// are what a product needs set to actually show up under "CoreXY", "Hobby",
// etc. instead of just the main unfiltered category list.
const TECHNOLOGIES: PrinterTechnology[] = ["FDM", "Resin", "CoreXY", "Large Format", "Industrial", "Educational", "DIY"];
const EXPERIENCE_LEVELS: ExperienceLevel[] = ["Beginner", "Intermediate", "Professional", "Industrial"];
const USE_CASES: UseCase[] = ["Hobby", "Engineering", "Prototyping", "Education", "Business", "Industrial"];

export interface FormVariant {
  id?: string;
  label: string;
  price: number | "";
  compareAtPrice: number | "";
  stock: number | "";
  sku: string;
  availability: Product["availability"];
  isDefault: boolean;
}

export interface ProductFormValues {
  slug: string;
  name: string;
  brandId: string;
  category: Product["category"];
  categoryId: string;
  subcategory: string;
  technology: PrinterTechnology[];
  experienceLevel: ExperienceLevel[];
  useCases: UseCase[];
  price: number | "";
  compareAtPrice: number | "";
  stock: number | "";
  lowStockThreshold: number | "";
  availability: Product["availability"];
  /** Blank means "use the site-wide default from Settings" — see ProductInput.preorderLeadDays. */
  preorderLeadDays: number | "";
  quoteOnly: boolean;
  featured: boolean;
  shortDescription: string;
  description: string;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  noindex: boolean;
  includeInSitemap: boolean;
  weightKg: number | "";
  warrantyMonths: number | "";
  soldCount: number | "";
  saleEndsAt: string;
  limitedStockEnabled: boolean;
  limitedStockQuantity: number | "";
}

// datetime-local inputs need "YYYY-MM-DDTHH:mm" in the browser's local time,
// not the ISO string (with seconds/Z) that comes back from the API.
function toDatetimeLocal(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromProduct(p: Product, preorderLeadDaysOverride: number | null): ProductFormValues {
  return {
    slug: p.slug,
    name: p.name,
    brandId: p.brandId,
    category: p.category,
    categoryId: p.categoryId ?? "",
    subcategory: p.subcategory,
    technology: p.technology ?? [],
    experienceLevel: p.experienceLevel ?? [],
    useCases: p.useCases ?? [],
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? "",
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold ?? "",
    availability: p.availability,
    preorderLeadDays: preorderLeadDaysOverride ?? "",
    quoteOnly: p.quoteOnly ?? false,
    featured: p.featured ?? false,
    shortDescription: p.shortDescription,
    description: p.description,
    seoTitle: p.seoTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    canonicalUrl: p.canonicalUrl ?? "",
    ogTitle: p.ogTitle ?? "",
    ogDescription: p.ogDescription ?? "",
    noindex: p.noindex ?? false,
    includeInSitemap: p.includeInSitemap ?? true,
    weightKg: p.weightKg ?? "",
    warrantyMonths: p.warrantyMonths,
    soldCount: p.soldCount ?? 0,
    saleEndsAt: toDatetimeLocal(p.saleEndsAt),
    limitedStockEnabled: p.limitedStockEnabled ?? false,
    limitedStockQuantity: p.limitedStockQuantity ?? "",
  };
}

export const emptyProductFormValues: ProductFormValues = {
  slug: "",
  name: "",
  brandId: "",
  category: "printers",
  categoryId: "",
  subcategory: "",
  technology: [],
  experienceLevel: [],
  useCases: [],
  price: "",
  compareAtPrice: "",
  stock: 0,
  lowStockThreshold: "",
  availability: "in-stock",
  preorderLeadDays: "",
  quoteOnly: false,
  featured: false,
  shortDescription: "",
  description: "",
  seoTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  noindex: false,
  includeInSitemap: true,
  weightKg: "",
  warrantyMonths: 0,
  soldCount: 0,
  saleEndsAt: "",
  limitedStockEnabled: false,
  limitedStockQuantity: "",
};

export function ProductForm({
  brands,
  categoryOptions,
  product,
  mediaItems,
  productId,
  preorderLeadDaysOverride,
  siteDefaultPreorderLeadDays,
}: {
  brands: Brand[];
  /** The admin-managed Category taxonomy (see /admin/categories) — optional, separate from the required `category` shop-section field above. */
  categoryOptions: { id: string; name: string }[];
  product?: Product;
  mediaItems?: MediaItem[];
  productId?: string;
  /** The raw, unresolved DB value (null = no override set) — see getProductAdminById. */
  preorderLeadDaysOverride?: number | null;
  /** Current site-wide default, just for the field's helper text — see Settings → Preorder lead time. */
  siteDefaultPreorderLeadDays: number;
}) {
  const [values, setValues] = useState<ProductFormValues>(
    product ? fromProduct(product, preorderLeadDaysOverride ?? null) : emptyProductFormValues
  );
  const [variants, setVariants] = useState<FormVariant[]>(
    (product?.variants ?? []).map((v) => ({
      id: v.id,
      label: v.label,
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? "",
      stock: v.stock,
      sku: v.sku ?? "",
      availability: v.availability,
      isDefault: v.isDefault,
    }))
  );
  const [photos, setPhotos] = useState<MediaItem[]>(mediaItems ?? []);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(product?.contentBlocks ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteWarnings, setPasteWarnings] = useState<string[]>([]);
  const router = useRouter();

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function addVariant() {
    setVariants((vs) => [
      ...vs,
      { label: "", price: "", compareAtPrice: "", stock: "", sku: "", availability: "in-stock", isDefault: vs.length === 0 },
    ]);
  }
  function updateVariant(index: number, patch: Partial<FormVariant>) {
    setVariants((vs) => vs.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }
  function removeVariant(index: number) {
    setVariants((vs) => vs.filter((_, i) => i !== index));
  }
  function setDefaultVariant(index: number) {
    setVariants((vs) => vs.map((v, i) => ({ ...v, isDefault: i === index })));
  }

  // Once variants exist, they're the real source of truth for price/stock —
  // the plain fields below become a read-only summary (see toDbInput's
  // matching logic in products.ts for why this stays consistent server-side
  // even if a request somehow skips the form).
  const derivedPrice = variants.length > 0 ? Math.min(...variants.map((v) => (v.price === "" ? 0 : v.price))) : null;
  const derivedStock =
    variants.length > 0 ? variants.reduce((sum, v) => sum + (v.stock === "" ? 0 : v.stock), 0) : null;

  // Only fills the form fields below — the product still isn't created
  // until you review and click "Create Product" yourself, same as typing
  // it in by hand. See src/lib/admin/parse-product-text.ts for the format.
  function handleParse() {
    const {
      values: parsed,
      contentBlocks: parsedBlocks,
      variants: parsedVariants,
      warnings,
    } = parseProductText(pasteText, brands);
    setValues((v) => ({ ...v, ...parsed }));
    if (parsedBlocks) setContentBlocks(parsedBlocks);
    if (parsedVariants) setVariants(parsedVariants);
    setPasteWarnings(warnings);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

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
      saleEndsAt: values.saleEndsAt === "" ? null : new Date(values.saleEndsAt).toISOString(),
      limitedStockQuantity: values.limitedStockQuantity === "" ? null : values.limitedStockQuantity,
      mediaIds: photos.map((p) => p.id),
      contentBlocks,
      variants: variants.map((v) => ({
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
      const res = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-5 rounded-xl border border-border bg-surface p-6">
      {error && (
        <p className="rounded-md bg-destructive-tint px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {!productId && (
        <div className="rounded-lg border border-dashed border-border-strong p-4">
          <button
            type="button"
            onClick={() => setPasteOpen((o) => !o)}
            className="focus-ring cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-600"
          >
            {pasteOpen ? "Hide" : "Paste product text to fill this form"}
          </button>
          {pasteOpen && (
            <div className="mt-3 space-y-3">
              <p className="text-xs text-ink-faint">
                Paste &ldquo;Label: value&rdquo; text (from a supplier sheet, ChatGPT, or written by hand) and click
                Parse to fill in the fields below — nothing is saved until you review and click Create Product
                yourself. A &ldquo;Specifications:&rdquo; section fills the spec table; a &ldquo;Variants:&rdquo;
                section (one pipe-separated variant per line, e.g. <code>Combo | Price: 65000 | Stock: 4 | Default</code>)
                fills the Variants section below instead of adding them by hand.
              </p>
              <textarea
                rows={8}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={"Name: L4\nBrand: LightMake\nCategory: machines\nSubcategory: Robots\nPrice: 250000\nStock: 5\nShort description: ...\nFull description: ...\n\nSpecifications:\nToolheads: 4, independent\n\nVariants:\nStandard | Price: 45000 | Stock: 10\nCombo (AMS Lite) | Price: 65000 | Stock: 4 | Default"}
                className={`${inputClass} font-mono text-xs`}
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleParse}>
                Parse
              </Button>
              {pasteWarnings.length > 0 && (
                <ul className="space-y-1 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {pasteWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" required>
          <input
            required
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="URL slug" hint="Leave blank to auto-generate from name">
          <input
            value={values.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder={values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Brand" required>
          <select
            required
            value={values.brandId}
            onChange={(e) => set("brandId", e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select a brand
            </option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category" required>
          <select
            required
            value={values.category}
            onChange={(e) => set("category", e.target.value as Product["category"])}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Type / subcategory" required hint='e.g. "FDM", "PLA", "Nozzles", "CNC"'>
          <input
            required
            value={values.subcategory}
            onChange={(e) => set("subcategory", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Internal category" hint="Your own organizational taxonomy — optional, doesn't affect the shop">
          <select value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputClass}>
            <option value="">None</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {values.category === "printers" && (
        <div className="border-t border-border pt-5">
          <span className="mb-1.5 block text-sm font-medium text-ink">Printer filters</span>
          <p className="mb-3 text-xs text-ink-faint">
            Controls which filters on the 3D Printers page and the header&rsquo;s mega menu (Technology,
            Shop by Experience, Shop by Use) this product shows up under. Leaving these unset doesn&rsquo;t
            hide the product — it still shows in the main, unfiltered 3D Printers list — it just won&rsquo;t
            appear when a visitor narrows down by one of these.
          </p>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">Technology</span>
            <p className="mb-1.5 text-xs text-ink-faint">Check all that genuinely apply — e.g. a large-format CoreXY FDM printer can be all three at once.</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {TECHNOLOGIES.map((t) => (
                <label key={t} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={values.technology.includes(t)}
                    onChange={(e) =>
                      set(
                        "technology",
                        e.target.checked ? [...values.technology, t] : values.technology.filter((x) => x !== t)
                      )
                    }
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Experience level</span>
              <div className="flex flex-col gap-1.5">
                {EXPERIENCE_LEVELS.map((level) => (
                  <label key={level} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={values.experienceLevel.includes(level)}
                      onChange={(e) =>
                        set(
                          "experienceLevel",
                          e.target.checked
                            ? [...values.experienceLevel, level]
                            : values.experienceLevel.filter((l) => l !== level)
                        )
                      }
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Use cases</span>
              <div className="flex flex-col gap-1.5">
                {USE_CASES.map((use) => (
                  <label key={use} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={values.useCases.includes(use)}
                      onChange={(e) =>
                        set(
                          "useCases",
                          e.target.checked
                            ? [...values.useCases, use]
                            : values.useCases.filter((u) => u !== use)
                        )
                      }
                    />
                    {use}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Field
          label="Price (PKR)"
          required
          hint={variants.length > 0 ? "Set from the cheapest variant below" : undefined}
        >
          <input
            type="number"
            min={0}
            required
            disabled={variants.length > 0}
            value={variants.length > 0 ? (derivedPrice ?? 0) : values.price}
            onChange={(e) => set("price", e.target.value === "" ? "" : Number(e.target.value))}
            className={`${inputClass} disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-faint`}
          />
        </Field>
        <Field
          label="Sale price (PKR)"
          hint={variants.length > 0 ? "Set per-variant below instead" : "Optional — shows as a strikethrough sale"}
        >
          <input
            type="number"
            min={0}
            disabled={variants.length > 0}
            value={variants.length > 0 ? "" : values.compareAtPrice}
            onChange={(e) => set("compareAtPrice", e.target.value === "" ? "" : Number(e.target.value))}
            className={`${inputClass} disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-faint`}
          />
        </Field>
        <Field
          label="Stock count"
          required
          hint={variants.length > 0 ? "Summed across variants below" : undefined}
        >
          <input
            type="number"
            min={0}
            required
            disabled={variants.length > 0}
            value={variants.length > 0 ? (derivedStock ?? 0) : values.stock}
            onChange={(e) => set("stock", e.target.value === "" ? "" : Number(e.target.value))}
            className={`${inputClass} disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-faint`}
          />
        </Field>
        <Field label="Low stock warning" hint="Show 'Only N left' below this count. Leave blank to disable.">
          <input
            type="number"
            min={1}
            value={values.lowStockThreshold}
            onChange={(e) => set("lowStockThreshold", e.target.value === "" ? "" : Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Warranty (months)" hint="0 means no warranty — shown on the product page and compare table">
          <input
            type="number"
            min={0}
            value={values.warrantyMonths}
            onChange={(e) => set("warrantyMonths", e.target.value === "" ? "" : Number(e.target.value))}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Availability"
        required
        hint={variants.length > 0 ? "Unused once variants exist — set availability per variant below" : undefined}
      >
        <select
          required
          value={values.availability}
          onChange={(e) => set("availability", e.target.value as Product["availability"])}
          className={inputClass}
        >
          <option value="in-stock">In stock</option>
          <option value="out-of-stock">Out of stock</option>
          <option value="preorder">Preorder</option>
        </select>
      </Field>

      {values.availability === "preorder" && (
        <Field
          label="Preorder lead time override (days)"
          hint={`Leave blank to use the site-wide default of ~${siteDefaultPreorderLeadDays} days (Settings → Preorder lead time). Shown as "Available for preorder (~N days)".`}
        >
          <input
            type="number"
            min={1}
            value={values.preorderLeadDays}
            onChange={(e) => set("preorderLeadDays", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={String(siteDefaultPreorderLeadDays)}
            className={inputClass}
          />
        </Field>
      )}

      <div className="border-t border-border pt-5">
        <div className="flex items-center justify-between">
          <span className="block text-sm font-medium text-ink">Variants</span>
          <button
            type="button"
            onClick={addVariant}
            className="focus-ring cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-600"
          >
            + Add variant
          </button>
        </div>
        <p className="mt-1 text-xs text-ink-faint">
          Optional. Add purchasable configurations of this same listing (e.g. &ldquo;Standard&rdquo; and
          &ldquo;Combo (AMS Lite)&rdquo;), each with its own price and stock — shown as a selector on the
          product page instead of one fixed price. Leave empty to use the Price/Stock fields above directly.
        </p>
        {variants.length > 0 && (
          <div className="mt-3 space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="rounded-lg border border-border-strong p-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Label" required>
                    <input
                      required
                      value={v.label}
                      onChange={(e) => updateVariant(i, { label: e.target.value })}
                      placeholder='e.g. "Combo (AMS Lite)"'
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Price (PKR)" required>
                    <input
                      type="number"
                      min={0}
                      required
                      value={v.price}
                      onChange={(e) =>
                        updateVariant(i, { price: e.target.value === "" ? "" : Number(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Sale price (PKR)" hint="Optional">
                    <input
                      type="number"
                      min={0}
                      value={v.compareAtPrice}
                      onChange={(e) =>
                        updateVariant(i, { compareAtPrice: e.target.value === "" ? "" : Number(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Stock" required>
                    <input
                      type="number"
                      min={0}
                      required
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(i, { stock: e.target.value === "" ? "" : Number(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Availability">
                    <select
                      value={v.availability}
                      onChange={(e) =>
                        updateVariant(i, { availability: e.target.value as Product["availability"] })
                      }
                      className={inputClass}
                    >
                      <option value="in-stock">In stock</option>
                      <option value="out-of-stock">Out of stock</option>
                      <option value="preorder">Preorder</option>
                    </select>
                  </Field>
                  <Field label="SKU" hint="Optional">
                    <input value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} className={inputClass} />
                  </Field>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                    <input
                      type="radio"
                      name="defaultVariant"
                      checked={v.isDefault}
                      onChange={() => setDefaultVariant(i)}
                    />
                    Default (pre-selected on the product page)
                  </label>
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="focus-ring cursor-pointer text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={values.quoteOnly}
            onChange={(e) => set("quoteOnly", e.target.checked)}
          />
          Quote only (hides Add to Cart, shows &ldquo;Request a Quote&rdquo;)
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          Featured on homepage
        </label>
      </div>

      <div className="border-t border-border pt-5">
        <span className="mb-1.5 block text-sm font-medium text-ink">Merchandising</span>
        <p className="mb-3 text-xs text-ink-faint">
          Optional urgency/social-proof messaging shown on the product card and page.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Weight (kg)" hint="Used to calculate shipping cost at checkout (250 PKR/kg, capped at 2500 PKR)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={values.weightKg}
              onChange={(e) => set("weightKg", e.target.value === "" ? "" : Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Sold count" hint='Shown as "N sold" when above 0 — set by hand, not from real orders'>
            <input
              type="number"
              min={0}
              value={values.soldCount}
              onChange={(e) => set("soldCount", e.target.value === "" ? "" : Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field
            label="Sale ends at"
            hint="Shows a live countdown on the product while set to a future date/time. Leave blank to hide."
          >
            <input
              type="datetime-local"
              value={values.saleEndsAt}
              onChange={(e) => set("saleEndsAt", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={values.limitedStockEnabled}
            onChange={(e) => set("limitedStockEnabled", e.target.checked)}
          />
          Show &ldquo;limited stock&rdquo; badge
        </label>
        {values.limitedStockEnabled && (
          <div className="mt-3">
            <Field label="Limited stock quantity" hint='Shown as "Only N left!" — independent of the real stock count above'>
              <input
                type="number"
                min={0}
                value={values.limitedStockQuantity}
                onChange={(e) => set("limitedStockQuantity", e.target.value === "" ? "" : Number(e.target.value))}
                className={inputClass}
              />
            </Field>
          </div>
        )}
      </div>

      <Field label="Photos" hint="Upload photos from the supplier — the first one becomes the main product image">
        <ImageUploader items={photos} onChange={setPhotos} />
      </Field>

      <Field label="Short description" required hint="Shown on product cards and at the top of the product page">
        <textarea
          required
          rows={2}
          value={values.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Full description" required hint="Fallback text shown when no content blocks are added below">
        <textarea
          required
          rows={5}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink">Product content</span>
        <p className="mb-3 text-xs text-ink-faint">
          Build a richer page out of blocks — images, feature grids, spec tables, FAQs and more. When blocks are
          added here, they replace the full description above on the product page.
        </p>
        <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
      </div>

      <div className="border-t border-border pt-5">
        <span className="mb-1.5 block text-sm font-medium text-ink">SEO</span>
        <p className="mb-3 text-xs text-ink-faint">
          Leave blank to fall back to the product name and short description above.
        </p>
        <div className="space-y-3">
          <Field label="SEO title" hint="Shown in search results and browser tabs">
            <input
              value={values.seoTitle}
              onChange={(e) => set("seoTitle", e.target.value)}
              placeholder={values.name}
              className={inputClass}
            />
          </Field>
          <Field label="Meta description">
            <textarea
              rows={2}
              value={values.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
              placeholder={values.shortDescription}
              className={inputClass}
            />
          </Field>
          <Field label="Canonical URL" hint="Only needed if this content is duplicated elsewhere">
            <input
              value={values.canonicalUrl}
              onChange={(e) => set("canonicalUrl", e.target.value)}
              placeholder={`https://infillpk.com/products/${values.slug || "..."}`}
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Social share title (og:title)">
              <input
                value={values.ogTitle}
                onChange={(e) => set("ogTitle", e.target.value)}
                placeholder={values.seoTitle || values.name}
                className={inputClass}
              />
            </Field>
            <Field label="Social share description (og:description)">
              <input
                value={values.ogDescription}
                onChange={(e) => set("ogDescription", e.target.value)}
                placeholder={values.metaDescription || values.shortDescription}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="flex gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={values.noindex} onChange={(e) => set("noindex", e.target.checked)} />
              Hide from search engines (noindex)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={values.includeInSitemap}
                onChange={(e) => set("includeInSitemap", e.target.checked)}
              />
              Include in sitemap.xml
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : productId ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}

const inputClass =
  "focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink placeholder:text-ink-faint";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}
