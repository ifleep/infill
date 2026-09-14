"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Brand, Product } from "@/lib/types";
import type { MediaItem } from "@/lib/admin/media-types";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";

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
  availability: Product["availability"];
  quoteOnly: boolean;
  featured: boolean;
  shortDescription: string;
  description: string;
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
    availability: p.availability,
    quoteOnly: p.quoteOnly ?? false,
    featured: p.featured ?? false,
    shortDescription: p.shortDescription,
    description: p.description,
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
  availability: "in-stock",
  quoteOnly: false,
  featured: false,
  shortDescription: "",
  description: "",
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
      mediaIds: photos.map((p) => p.id),
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
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-xl border border-border bg-surface p-6">
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

      <Field label="Full description" required>
        <textarea
          required
          rows={5}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputClass}
        />
      </Field>

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
