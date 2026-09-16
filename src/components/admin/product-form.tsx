"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Brand, Product } from "@/lib/types";
import type { ContentBlock } from "@/lib/content-blocks/types";
import type { MediaItem } from "@/lib/admin/media-types";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ContentBlockEditor } from "@/components/admin/content-block-editor";

const categories: { value: Product["category"]; label: string }[] = [
  { value: "printers", label: "3D Printer" },
  { value: "filament", label: "Filament" },
  { value: "resin", label: "Resin" },
  { value: "parts", label: "Parts & Accessories" },
  { value: "machines", label: "Machine (CNC/UV/Laser)" },
];

export interface ProductFormValues {
  slug: string;
  name: string;
  brandId: string;
  category: Product["category"];
  subcategory: string;
  price: number | "";
  compareAtPrice: number | "";
  stock: number | "";
  lowStockThreshold: number | "";
  availability: Product["availability"];
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

function fromProduct(p: Product): ProductFormValues {
  return {
    slug: p.slug,
    name: p.name,
    brandId: p.brandId,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? "",
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold ?? "",
    availability: p.availability,
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
    soldCount: p.soldCount ?? 0,
    saleEndsAt: toDatetimeLocal(p.saleEndsAt),
    limitedStockEnabled: p.limitedStockEnabled ?? false,
    limitedStockQuantity: p.limitedStockQuantity ?? "",
  };
}

const empty: ProductFormValues = {
  slug: "",
  name: "",
  brandId: "",
  category: "printers",
  subcategory: "",
  price: "",
  compareAtPrice: "",
  stock: 0,
  lowStockThreshold: "",
  availability: "in-stock",
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
  soldCount: 0,
  saleEndsAt: "",
  limitedStockEnabled: false,
  limitedStockQuantity: "",
};

export function ProductForm({
  brands,
  product,
  mediaItems,
  productId,
}: {
  brands: Brand[];
  product?: Product;
  mediaItems?: MediaItem[];
  productId?: string;
}) {
  const [values, setValues] = useState<ProductFormValues>(product ? fromProduct(product) : empty);
  const [photos, setPhotos] = useState<MediaItem[]>(mediaItems ?? []);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(product?.contentBlocks ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      ...values,
      price: values.price === "" ? 0 : values.price,
      compareAtPrice: values.compareAtPrice === "" ? null : values.compareAtPrice,
      stock: values.stock === "" ? 0 : values.stock,
      lowStockThreshold: values.lowStockThreshold === "" ? null : values.lowStockThreshold,
      weightKg: values.weightKg === "" ? null : values.weightKg,
      soldCount: values.soldCount === "" ? 0 : values.soldCount,
      saleEndsAt: values.saleEndsAt === "" ? null : new Date(values.saleEndsAt).toISOString(),
      limitedStockQuantity: values.limitedStockQuantity === "" ? null : values.limitedStockQuantity,
      mediaIds: photos.map((p) => p.id),
      contentBlocks,
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

      <Field label="Type / subcategory" required hint='e.g. "FDM", "PLA", "Nozzles", "CNC"'>
        <input
          required
          value={values.subcategory}
          onChange={(e) => set("subcategory", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Price (PKR)" required>
          <input
            type="number"
            min={0}
            required
            value={values.price}
            onChange={(e) => set("price", e.target.value === "" ? "" : Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Sale price (PKR)" hint="Optional — shows as a strikethrough sale">
          <input
            type="number"
            min={0}
            value={values.compareAtPrice}
            onChange={(e) => set("compareAtPrice", e.target.value === "" ? "" : Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Stock count" required>
          <input
            type="number"
            min={0}
            required
            value={values.stock}
            onChange={(e) => set("stock", e.target.value === "" ? "" : Number(e.target.value))}
            className={inputClass}
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
      </div>

      <Field label="Availability" required>
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
