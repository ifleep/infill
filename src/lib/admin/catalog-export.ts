import ExcelJS from "exceljs";
import type { Product } from "@/lib/types";
import type { ContentBlock } from "@/lib/content-blocks/types";

const PRODUCT_HEADERS = [
  "Name",
  "Slug",
  "Brand",
  "Category",
  "Subcategory",
  "Technology",
  "Experience Level",
  "Use Cases",
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
  "Has Content Blocks",
  "Content Blocks Word Count",
  "Total Content Word Count",
  "Images",
] as const;

function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
}

/**
 * A rough but honest count of the real on-page text a content block
 * contributes — used to tell a thin product page (short legacy
 * description, nothing filling in for it) apart from one that just moved
 * its real content into blocks (spec table, feature grid, FAQ, etc.),
 * since Google's indexing decisions care about actual visible text, not
 * which field it's stored in.
 */
function contentBlockWordCount(block: ContentBlock): number {
  switch (block.type) {
    case "heading":
      return wordCount(block.text);
    case "richText":
      return wordCount(stripHtml(block.html));
    case "imageText":
      return wordCount(block.heading ?? "") + wordCount(stripHtml(block.html));
    case "featureGrid":
      return block.items.reduce((sum, item) => sum + wordCount(item.title) + wordCount(item.text), 0);
    case "specTable":
      return block.rows.reduce((sum, row) => sum + wordCount(row.label) + wordCount(row.value), 0);
    case "comparisonTable":
      return (
        wordCount(block.columnHeadings.join(" ")) +
        block.rows.reduce((sum, row) => sum + wordCount(row.label) + wordCount(row.values.join(" ")), 0)
      );
    case "callout":
      return wordCount(stripHtml(block.html));
    case "quote":
      return wordCount(block.text) + wordCount(block.attribution ?? "");
    case "faq":
      return block.items.reduce((sum, item) => sum + wordCount(item.question) + wordCount(item.answer), 0);
    case "image":
    case "gallery":
    case "video":
    case "download":
    case "spacer":
      return 0;
  }
}

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
    { width: 16 }, { width: 24 }, { width: 24 }, { width: 12 }, { width: 14 },
    { width: 9 }, { width: 13 }, { width: 12 }, { width: 10 }, { width: 12 },
    { width: 10 }, { width: 9 }, { width: 10 }, { width: 8 }, { width: 11 },
    { width: 18 }, { width: 11 }, { width: 18 }, { width: 12 }, { width: 40 },
    { width: 50 }, { width: 14 }, { width: 16 }, { width: 16 }, { width: 40 },
  ];
  productsSheet.views = [{ state: "frozen", ySplit: 1 }];

  for (const p of products) {
    const blocks = p.contentBlocks ?? [];
    const blocksWordCount = blocks.reduce((sum, block) => sum + contentBlockWordCount(block), 0);
    const totalWordCount = wordCount(p.shortDescription) + wordCount(p.description) + blocksWordCount;
    productsSheet.addRow([
      p.name,
      p.slug,
      p.brandName,
      p.category,
      p.subcategory,
      p.technology?.join(", ") ?? "",
      p.experienceLevel?.join(", ") ?? "",
      p.useCases?.join(", ") ?? "",
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
      blocks.length > 0,
      blocksWordCount,
      totalWordCount,
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
