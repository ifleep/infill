import type { Brand, Product } from "@/lib/types";
import type { ContentBlock } from "@/lib/content-blocks/types";
import { newBlockId } from "@/lib/content-blocks/types";
import type { ProductFormValues } from "@/components/admin/product-form";

// Parses the plain-text "paste to fill" format into the same fields the Add
// Product form already has — this only ever fills in the form, it never
// talks to the database itself. Creating the product still goes through the
// normal form submit (POST /api/admin/products), with the exact same
// validation as typing it in by hand, so a bad paste can't create a broken
// product any more than a bad manual entry could.
//
// Format: one "Label: value" per line. A value can span multiple lines —
// any line that doesn't start a recognized label is treated as a
// continuation of the previous field. A line that's exactly
// "Specifications:" switches into spec-row mode, where every following
// "Label: value" line becomes a row in a Specification table content block.

const FIELD_ALIASES: Record<string, keyof ProductFormValues> = {
  name: "name",
  slug: "slug",
  "url slug": "slug",
  brand: "brandId",
  category: "category",
  subcategory: "subcategory",
  type: "subcategory",
  "type / subcategory": "subcategory",
  price: "price",
  "sale price": "compareAtPrice",
  "compare at price": "compareAtPrice",
  stock: "stock",
  "stock count": "stock",
  "low stock warning": "lowStockThreshold",
  availability: "availability",
  "quote only": "quoteOnly",
  featured: "featured",
  warranty: "warrantyMonths",
  "warranty (months)": "warrantyMonths",
  "short description": "shortDescription",
  "full description": "description",
  description: "description",
  "seo title": "seoTitle",
  "meta description": "metaDescription",
};

const CATEGORY_ALIASES: Record<string, Product["category"]> = {
  printers: "printers",
  "3d printer": "printers",
  "3d printers": "printers",
  filament: "filament",
  resin: "resin",
  parts: "parts",
  "parts & accessories": "parts",
  "parts and accessories": "parts",
  machines: "machines",
  machine: "machines",
};

function parseBoolean(raw: string): boolean {
  return /^(yes|true|y)$/i.test(raw.trim());
}

export interface ParsedProductText {
  values: Partial<ProductFormValues>;
  contentBlocks: ContentBlock[] | null;
  warnings: string[];
}

export function parseProductText(text: string, brands: Brand[]): ParsedProductText {
  const warnings: string[] = [];
  const values: Partial<ProductFormValues> = {};
  const specRows: { label: string; value: string }[] = [];

  const lines = text.split(/\r?\n/);
  let currentField: keyof ProductFormValues | null = null;
  let inSpecs = false;

  const flushMultiline = (field: keyof ProductFormValues, extra: string) => {
    const existing = values[field];
    (values as Record<string, unknown>)[field] =
      typeof existing === "string" && existing.length > 0 ? `${existing}\n${extra}` : extra;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (/^specifications:\s*$/i.test(line.trim())) {
      inSpecs = true;
      currentField = null;
      continue;
    }

    const match = line.match(/^([A-Za-z0-9 /()]+):\s?(.*)$/);
    if (inSpecs) {
      if (match) {
        specRows.push({ label: match[1].trim(), value: match[2].trim() });
      }
      // Blank/unmatched lines inside the spec section are just skipped —
      // specs are single-line label/value pairs, unlike the free-text fields.
      continue;
    }

    if (match) {
      const label = match[1].trim().toLowerCase();
      const field = FIELD_ALIASES[label];
      if (field) {
        currentField = field;
        (values as Record<string, unknown>)[field] = match[2].trim();
        continue;
      }
      // Unrecognized "Label: value" line — surfaces to the user instead of
      // silently dropping data they clearly meant to include.
      warnings.push(`Didn't recognize "${match[1].trim()}" — skipped that line.`);
      currentField = null;
      continue;
    }

    if (currentField && line.trim()) {
      flushMultiline(currentField, line.trim());
    }
  }

  // Category: accept either the internal value or a friendly label.
  if (typeof values.category === "string") {
    const key = (values.category as string).trim().toLowerCase();
    const resolved = CATEGORY_ALIASES[key];
    if (resolved) {
      values.category = resolved;
    } else {
      warnings.push(`Category "${values.category}" not recognized — left unset, pick one manually.`);
      delete values.category;
    }
  }

  // Brand: match by name, case-insensitive — brands must already exist
  // (add it under /admin/brands first if it's new), same requirement as
  // picking one from the dropdown by hand.
  if (typeof values.brandId === "string") {
    const raw = (values.brandId as string).trim();
    const found = brands.find((b) => b.name.toLowerCase() === raw.toLowerCase());
    if (found) {
      values.brandId = found.id;
    } else {
      warnings.push(`Brand "${raw}" not found — add it under /admin/brands first, then select it manually.`);
      delete values.brandId;
    }
  }

  // Availability: accept "In stock" / "Out of stock" / "Preorder" too.
  if (typeof values.availability === "string") {
    const key = (values.availability as string).trim().toLowerCase();
    if (key === "in stock" || key === "in-stock") values.availability = "in-stock";
    else if (key === "out of stock" || key === "out-of-stock") values.availability = "out-of-stock";
    else if (key === "preorder") values.availability = "preorder";
    else {
      warnings.push(`Availability "${values.availability}" not recognized — defaulted to In stock.`);
      values.availability = "in-stock";
    }
  }

  if (typeof values.quoteOnly === "string") values.quoteOnly = parseBoolean(values.quoteOnly as unknown as string);
  if (typeof values.featured === "string") values.featured = parseBoolean(values.featured as unknown as string);

  for (const numField of ["price", "compareAtPrice", "stock", "lowStockThreshold", "warrantyMonths"] as const) {
    const raw = values[numField];
    if (typeof raw === "string") {
      const n = Number(raw.replace(/[,\s]/g, ""));
      (values as Record<string, unknown>)[numField] = Number.isFinite(n) ? n : "";
      if (!Number.isFinite(n) && raw.trim()) {
        warnings.push(`Couldn't read "${raw}" as a number for ${numField} — left blank.`);
      }
    }
  }

  // The description stays in its own field and always renders on the
  // product page regardless of content blocks (see the product page's
  // Overview section) — content blocks here are just the spec table, kept
  // separate so it can be freely added to, edited or removed in the block
  // editor without ever affecting the description.
  const contentBlocks =
    specRows.length > 0 ? [{ id: newBlockId(), type: "specTable" as const, rows: specRows }] : null;

  return { values, contentBlocks, warnings };
}
