import PDFDocument from "pdfkit";
import { formatPKR } from "@/lib/format";
import type { InvoiceData } from "@/lib/invoice/types";

// Palette sampled directly from the real INFiLL PK invoice template.
const NAVY = "#0F172A";
const GREEN = "#10B981";
const CARD_BG = "#F3F4F6";
const INK = "#111827";
const INK_FAINT = "#6B7280";
const WHITE = "#FFFFFF";
const ON_NAVY_MUTED = "#9CA3AF";
const BORDER = "#E5E7EB";
const DESTRUCTIVE = "#B91C1C";

const mm = (n: number) => n * 2.8346456693; // mm -> pt, matches the A4 layout proven in the earlier reportlab draft

const PAGE_W = mm(210);
const MARGIN = mm(20);
const CONTENT_W = PAGE_W - 2 * MARGIN;
const BAND_H = mm(46);

function drawHeader(doc: PDFKit.PDFDocument, data: InvoiceData) {
  doc.rect(0, 0, PAGE_W, BAND_H).fill(NAVY);
  doc.rect(0, BAND_H, PAGE_W, mm(1.3)).fill(GREEN);

  doc.font("Helvetica-Bold").fontSize(22);
  const wordmarkY = mm(14);
  doc.fillColor(WHITE).text("INFiLL ", MARGIN, wordmarkY, { continued: true });
  doc.fillColor(GREEN).text("PK");

  doc.font("Helvetica-Bold").fontSize(18).fillColor(WHITE);
  doc.text("E-INVOICE", MARGIN, mm(13), { width: CONTENT_W, align: "right" });

  doc.font("Helvetica").fontSize(8.5).fillColor(ON_NAVY_MUTED);
  doc.text("Invoice No.", MARGIN, mm(20.5), { width: CONTENT_W, align: "right" });
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(WHITE);
  doc.text(data.orderNumber, MARGIN, mm(24.5), { width: CONTENT_W, align: "right" });

  doc.font("Helvetica").fontSize(8.5).fillColor(ON_NAVY_MUTED);
  doc.text("Issue Date", MARGIN, mm(30.5), { width: CONTENT_W, align: "right" });
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(WHITE);
  doc.text(data.placedAt, MARGIN, mm(34.5), { width: CONTENT_W, align: "right" });
}

function drawCard(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  label: string,
  lines: { text: string; bold?: boolean }[]
): number {
  const padding = mm(5);
  const lineHeight = mm(5.5);
  const labelH = mm(6);
  const h = padding * 2 + labelH + lines.length * lineHeight;

  doc.roundedRect(x, y, w, h, 4).fill(CARD_BG);

  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(GREEN);
  doc.text(label, x + padding, y + padding, { width: w - padding * 2 });

  let lineY = y + padding + labelH;
  for (const line of lines) {
    doc.font(line.bold ? "Helvetica-Bold" : "Helvetica").fontSize(line.bold ? 11 : 9.5).fillColor(INK);
    doc.text(line.text, x + padding, lineY, { width: w - padding * 2 });
    lineY += lineHeight;
  }
  return h;
}

function drawSectionCard(
  doc: PDFKit.PDFDocument,
  y: number,
  label: string,
  paragraphs: { segments: { text: string; bold?: boolean; color?: string }[] }[]
): number {
  const x = MARGIN;
  const w = CONTENT_W;
  const padding = mm(5);
  const labelH = mm(6);
  const lineHeight = mm(5.2);
  const h = padding * 2 + labelH + paragraphs.length * lineHeight;

  doc.roundedRect(x, y, w, h, 4).fill(CARD_BG);
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(GREEN);
  doc.text(label, x + padding, y + padding, { width: w - padding * 2 });

  let lineY = y + padding + labelH;
  for (const para of paragraphs) {
    let cursorX = x + padding;
    for (const seg of para.segments) {
      doc.font(seg.bold ? "Helvetica-Bold" : "Helvetica").fontSize(9.5).fillColor(seg.color ?? INK);
      doc.text(seg.text, cursorX, lineY, { continued: false, lineBreak: false });
      cursorX += doc.widthOfString(seg.text);
    }
    lineY += lineHeight;
  }
  return h;
}

export function renderInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawHeader(doc, data);

    let y = BAND_H + mm(14);

    // BILLED TO / SHIP TO cards
    const cardW = (CONTENT_W - mm(4)) / 2;
    const billedLines = [
      { text: data.billedToName, bold: true },
      ...(data.billedToEmail ? [{ text: data.billedToEmail }] : []),
      ...(data.billedToPhone ? [{ text: data.billedToPhone }] : []),
    ];
    const shipLines = [
      { text: data.shipToName, bold: true },
      ...data.shipToLines.map((l) => ({ text: l })),
      ...(data.shipToPhone ? [{ text: data.shipToPhone }] : []),
    ];
    const billedH = drawCard(doc, MARGIN, y, cardW, "BILLED TO", billedLines);
    const shipH = drawCard(doc, MARGIN + cardW + mm(4), y, cardW, "SHIP TO", shipLines);
    y += Math.max(billedH, shipH) + mm(8);

    // Items table
    const colNum = mm(8);
    const colQty = mm(14);
    const colUnit = mm(28);
    const colAmount = mm(28);
    const colDesc = CONTENT_W - colNum - colQty - colUnit - colAmount;
    const xDesc = MARGIN + colNum;
    const xQty = xDesc + colDesc;
    const xUnit = xQty + colQty;
    const xAmount = xUnit + colUnit;

    const headerRowH = mm(8);
    doc.rect(MARGIN, y, CONTENT_W, headerRowH).fill(NAVY);
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(WHITE);
    doc.text("#", MARGIN + mm(2.5), y + mm(2.3), { width: colNum - mm(2.5) });
    doc.text("DESCRIPTION", xDesc, y + mm(2.3), { width: colDesc });
    doc.text("QTY", xQty, y + mm(2.3), { width: colQty - mm(2), align: "right" });
    doc.text("UNIT PRICE", xUnit, y + mm(2.3), { width: colUnit - mm(2), align: "right" });
    doc.text("AMOUNT", xAmount, y + mm(2.3), { width: colAmount - mm(2.5), align: "right" });
    y += headerRowH;

    for (const item of data.items) {
      const rowPadTop = mm(3);
      const nameH = mm(5);
      const skuH = item.sku ? mm(4) : 0;
      const rowH = rowPadTop * 2 + nameH + skuH;

      doc.font("Helvetica").fontSize(9.5).fillColor(INK);
      doc.text(String(data.items.indexOf(item) + 1), MARGIN + mm(2.5), y + rowPadTop, { width: colNum - mm(2.5) });

      doc.font("Helvetica-Bold").fontSize(10.5).fillColor(INK);
      doc.text(item.description, xDesc, y + rowPadTop, { width: colDesc - mm(2) });
      if (item.sku) {
        doc.font("Helvetica").fontSize(8.5).fillColor(INK_FAINT);
        doc.text(`SKU: ${item.sku}`, xDesc, y + rowPadTop + nameH, { width: colDesc - mm(2) });
      }

      doc.font("Helvetica").fontSize(9.5).fillColor(INK);
      doc.text(String(item.qty), xQty, y + rowPadTop, { width: colQty - mm(2), align: "right" });
      doc.text(formatPKR(item.unitPrice), xUnit, y + rowPadTop, { width: colUnit - mm(2), align: "right" });
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(INK);
      doc.text(formatPKR(item.amount), xAmount, y + rowPadTop, { width: colAmount - mm(2.5), align: "right" });

      y += rowH;
      doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).lineWidth(0.75).strokeColor(BORDER).stroke();
    }

    y += mm(6);

    // Totals block, right-aligned
    const totalsW = mm(79);
    const totalsX = MARGIN + CONTENT_W - totalsW;
    const rowH = mm(6);

    doc.font("Helvetica").fontSize(9.5).fillColor(INK);
    doc.text("Subtotal", totalsX, y, { width: totalsW * 0.5 });
    doc.text(formatPKR(data.subtotal), totalsX, y, { width: totalsW, align: "right" });
    y += rowH;

    doc.text("Shipping", totalsX, y, { width: totalsW * 0.5 });
    doc.text(formatPKR(data.shippingCost), totalsX, y, { width: totalsW, align: "right" });
    y += rowH;

    if (data.discount > 0) {
      const label = data.couponCode ? `Discount (${data.couponCode})` : "Discount";
      doc.text(label, totalsX, y, { width: totalsW });
      // A plain hyphen, not U+2212 — pdfkit's standard Helvetica encoding
      // (WinAnsi) doesn't have a glyph for the real minus sign and silently
      // substitutes a stray quote mark instead.
      doc.text(`- ${formatPKR(data.discount)}`, totalsX, y, { width: totalsW, align: "right" });
      y += rowH;
    }

    y += mm(2);
    const badgeH = mm(13);
    doc.roundedRect(totalsX, y, totalsW, badgeH, 4).fill(GREEN);
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(WHITE);
    doc.text("TOTAL (PKR)", totalsX + mm(3), y + mm(4), { width: totalsW * 0.5 });
    doc.font("Helvetica-Bold").fontSize(15).fillColor(WHITE);
    doc.text(formatPKR(data.total), totalsX, y + mm(3), { width: totalsW - mm(3), align: "right" });
    y += badgeH + mm(4);

    doc.font("Helvetica-Oblique").fontSize(9.5).fillColor(INK_FAINT);
    doc.text(data.amountInWords, totalsX, y, { width: totalsW, align: "right" });
    y += mm(10);

    if (data.bankAccount) {
      const statusColor = data.paymentStatus === "unpaid" ? DESTRUCTIVE : INK;
      const statusText = data.paymentStatus === "unpaid" ? "Status: UNPAID" : `Status: ${data.paymentStatus.toUpperCase()}`;
      y += drawSectionCard(doc, y, "PAYMENT DETAILS", [
        { segments: [{ text: statusText, bold: true, color: statusColor }, { text: `   —  ${data.paymentMethodLabel}` }] },
        { segments: [{ text: " " }] },
        { segments: [{ text: "Account Title: " }, { text: data.bankAccount.accountTitle, bold: true }] },
        { segments: [{ text: `Bank: ${data.bankAccount.bankName}` }] },
        { segments: [{ text: "IBAN: " }, { text: data.bankAccount.iban, bold: true }] },
      ]);
      y += mm(5);
    }

    y += drawSectionCard(doc, y, "NOTES", [
      { segments: [{ text: "Warranty: ", bold: true }, { text: data.warrantyNote }] },
    ]);
    y += mm(10);

    doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).lineWidth(0.5).strokeColor(BORDER).stroke();
    y += mm(5);
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(INK);
    doc.text("Thank you for shopping with INFiLL PK", MARGIN, y, { width: CONTENT_W, align: "center" });
    y += mm(5);
    doc.font("Helvetica").fontSize(8).fillColor(INK_FAINT);
    doc.text("This is a computer-generated e-invoice and does not require a signature.", MARGIN, y, {
      width: CONTENT_W,
      align: "center",
    });

    doc.end();
  });
}
