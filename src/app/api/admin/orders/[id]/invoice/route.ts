import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/data/settings";
import { buildInvoiceData } from "@/lib/invoice/build-invoice-data";
import { renderInvoicePdf } from "@/lib/invoice/invoice-pdf";
import { renderInvoiceDocx } from "@/lib/invoice/invoice-docx";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "docx" ? "docx" : "pdf";
  const bankAccountId = searchParams.get("bankAccountId");

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const settings = await getSiteSettings();
  const bankAccount = bankAccountId
    ? (settings.savedBankAccounts.find((a) => a.id === bankAccountId) ?? null)
    : null;

  const data = buildInvoiceData(order, bankAccount);
  const fileBase = `INFiLL-PK-Invoice-${order.orderNumber}`;

  if (format === "docx") {
    const buffer = await renderInvoiceDocx(data);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileBase}.docx"`,
      },
    });
  }

  const buffer = await renderInvoicePdf(data);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileBase}.pdf"`,
    },
  });
}
