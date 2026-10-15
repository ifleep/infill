import ExcelJS from "exceljs";
import type { Product } from "@/lib/types";

const PRODUCT_HEADERS = [
  "Name",
  "Slug",
  "Brand",
  "Category",
  "Subcategory",
  "Technology",
  "Price (PKR)",
  "Sale Price (PKR)",
  "Stock",
  "Availability",
  "Preorder Lead Days",
  "Quote Only",
  "Warranty (months)",
  "Featured",
  "Hidden",
  "Sold Count",
  "Rating",
  "Review Count",
  "Materials",
  "Weight (kg)",
  "Build Volume",
  "Speed (mm/s)",
  "Short Description",
  "Full Description",
  "Images",
] as const;

const VARIANT_HEADERS = [
  "Product Name",
  "Product Slug",
  "Variant Label",
  "Price (PKR)",
  "Sale Price (PKR)",
  "Stock",
  "SKU",
  "Color Hex",
  "Availability",
  "Default",
] as const;

function styleHeaderRow(row: ExcelJS.Row) {
  row.font = { name: "Arial", bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F3864" } };
  row.alignment = { vertical: "middle", wrapText: true };
}

/**
 * Builds the full catalog export admins download from /admin: one row per
 * product on "Products", one row per variant (with its parent product's
 * name/slug for reference) on "Variants" — kept as two normalized sheets
 * rather than cramming variants into a single cell, since the real use case
 * (seen repeatedly) is editing prices in Excel, which needs each variant in
 * its own row/cell to be usable.
 */
export async function buildCatalogWorkbook(products: Product[]): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "INFiLLPK Admin";
  wb.created = new Date();

  const productsSheet = wb.addWorksheet("Products");
  productsSheet.addRow([...PRODUCT_HEADERS]);
  styleHeaderRow(productsSheet.getRow(1));
  productsSheet.columns = [
    { width: 28 }, { width: 24 }, { width: 14 }, { width: 12 }, { width: 16 },
    { width: 16 }, { width: 12 }, { width: 14 }, { width: 9 }, { width: 13 },
    { width: 12 }, { width: 10 }, { width: 12 }, { width: 10 }, { width: 9 },
    { width: 10 }, { width: 8 }, { width: 11 }, { width: 18 }, { width: 11 },
    { width: 18 }, { width: 12 }, { width: 40 }, { width: 50 }, { width: 40 },
  ];
  productsSheet.views = [{ state: "frozen", ySplit: 1 }];

  for (const p of products) {
    productsSheet.addRow([
      p.name,
      p.slug,
      p.brandName,
      p.category,
      p.subcategory,
      p.technology?.join(", ") ?? "",
      p.price,
      p.compareAtPrice ?? "",
      p.stock,
      p.availability,
      p.preorderLeadDays,
      p.quoteOnly ?? false,
      p.warrantyMonths,
      p.featured ?? false,
      p.hidden ?? false,
      p.soldCount ?? 0,
      p.rating ?? "",
      p.reviewCount ?? 0,
      p.materials?.join(", ") ?? "",
      p.weightKg ?? "",
      p.buildVolume ? `${p.buildVolume.x} x ${p.buildVolume.y} x ${p.buildVolume.z} mm` : "",
      p.speedMmPerSec ?? "",
      p.shortDescription,
      p.description,
      p.images.join(", "),
    ]);
  }

  const variantsSheet = wb.addWorksheet("Variants");
  variantsSheet.addRow([...VARIANT_HEADERS]);
  styleHeaderRow(variantsSheet.getRow(1));
  variantsSheet.columns = [
    { width: 28 }, { width: 24 }, { width: 22 }, { width: 12 }, { width: 14 },
    { width: 9 }, { width: 16 }, { width: 11 }, { width: 13 }, { width: 9 },
  ];
  variantsSheet.views = [{ state: "frozen", ySplit: 1 }];

  for (const p of products) {
    for (const v of p.variants) {
      variantsSheet.addRow([
        p.name,
        p.slug,
        v.label,
        v.price,
        v.compareAtPrice ?? "",
        v.stock,
        v.sku ?? "",
        v.colorHex ?? "",
        v.availability,
        v.isDefault,
      ]);
    }
  }

  return wb;
}
