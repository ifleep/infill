import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { getAllProducts } from "@/lib/data/products";
import { buildCatalogWorkbook } from "@/lib/admin/catalog-export";

// One-click "download the whole catalog" for bulk price edits elsewhere
// (Excel, or pasting the result back in via each product's "paste to fill"
// box) — every product on a "Products" sheet, every variant on its own row
// on a "Variants" sheet, referenced back to its parent by name/slug.
export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await getAllProducts();
  const workbook = await buildCatalogWorkbook(products);
  const buffer = await workbook.xlsx.writeBuffer();
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="infillpk-catalog-${date}.xlsx"`,
    },
  });
}
