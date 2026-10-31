import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType,
  BorderStyle,
} from "docx";
import { formatPKR } from "@/lib/format";
import type { InvoiceData } from "@/lib/invoice/types";

// Same palette as the PDF (src/lib/invoice/invoice-pdf.tsx), minus the "#".
const NAVY = "0F172A";
const GREEN = "10B981";
const CARD_BG = "F3F4F6";
const INK = "111827";
const INK_FAINT = "6B7280";
const WHITE = "FFFFFF";
const DESTRUCTIVE = "B91C1C";

function noBorders() {
  const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  return { top: none, bottom: none, left: none, right: none };
}

function headerBand(data: InvoiceData) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders(),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: NAVY, color: "auto" },
            margins: { top: 300, bottom: 300, left: 200, right: 200 },
            borders: noBorders(),
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "INFiLL ", bold: true, size: 36, color: WHITE }),
                  new TextRun({ text: "PK", bold: true, size: 36, color: GREEN }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: NAVY, color: "auto" },
            margins: { top: 300, bottom: 300, left: 200, right: 200 },
            borders: noBorders(),
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "E-INVOICE", bold: true, size: 28, color: WHITE })],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 100 },
                children: [new TextRun({ text: "Invoice No.", size: 16, color: "9CA3AF" })],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: data.orderNumber, bold: true, size: 20, color: WHITE })],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 80 },
                children: [new TextRun({ text: "Issue Date", size: 16, color: "9CA3AF" })],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: data.placedAt, bold: true, size: 20, color: WHITE })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function accentBar() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders(),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: GREEN, color: "auto" },
            borders: noBorders(),
            margins: { top: 40, bottom: 40, left: 0, right: 0 },
            children: [new Paragraph({ children: [] })],
          }),
        ],
      }),
    ],
  });
}

function cardCell(label: string, lines: string[], widthPct: number) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: CARD_BG, color: "auto" },
    margins: { top: 200, bottom: 200, left: 200, right: 200 },
    borders: noBorders(),
    children: [
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: label, bold: true, size: 17, color: GREEN })],
      }),
      ...lines.map(
        (line, i) =>
          new Paragraph({
            children: [new TextRun({ text: line, bold: i === 0, size: 20, color: INK })],
          })
      ),
    ],
  });
}

function cardsRow(data: InvoiceData) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders(),
    rows: [
      new TableRow({
        children: [
          cardCell(
            "BILLED TO",
            [data.billedToName, data.billedToEmail, data.billedToPhone].filter(Boolean),
            48
          ),
          new TableCell({ width: { size: 4, type: WidthType.PERCENTAGE }, borders: noBorders(), children: [] }),
          cardCell(
            "SHIP TO",
            [data.shipToName, ...data.shipToLines, data.shipToPhone].filter(Boolean),
            48
          ),
        ],
      }),
    ],
  });
}

function itemsTable(data: InvoiceData) {
  const headerCells = ["#", "DESCRIPTION", "QTY", "UNIT PRICE", "AMOUNT"].map(
    (h, i) =>
      new TableCell({
        shading: { type: ShadingType.CLEAR, fill: NAVY, color: "auto" },
        margins: { top: 120, bottom: 120, left: 150, right: 150 },
        borders: noBorders(),
        children: [
          new Paragraph({
            alignment: i >= 2 ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [new TextRun({ text: h, bold: true, size: 16, color: WHITE })],
          }),
        ],
      })
  );

  const rows = [new TableRow({ children: headerCells })];
  data.items.forEach((item, i) => {
    const bottomBorder = {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
    };
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            margins: { top: 150, bottom: 150, left: 150, right: 150 },
            borders: bottomBorder,
            children: [new Paragraph({ children: [new TextRun({ text: String(i + 1), size: 19 })] })],
          }),
          new TableCell({
            margins: { top: 150, bottom: 150, left: 150, right: 150 },
            borders: bottomBorder,
            children: [
              new Paragraph({ children: [new TextRun({ text: item.description, bold: true, size: 20 })] }),
              ...(item.sku
                ? [new Paragraph({ children: [new TextRun({ text: `SKU: ${item.sku}`, size: 16, color: INK_FAINT })] })]
                : []),
            ],
          }),
          new TableCell({
            margins: { top: 150, bottom: 150, left: 150, right: 150 },
            borders: bottomBorder,
            children: [
              new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: String(item.qty), size: 19 })] }),
            ],
          }),
          new TableCell({
            margins: { top: 150, bottom: 150, left: 150, right: 150 },
            borders: bottomBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: formatPKR(item.unitPrice), size: 19 })],
              }),
            ],
          }),
          new TableCell({
            margins: { top: 150, bottom: 150, left: 150, right: 150 },
            borders: bottomBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: formatPKR(item.amount), bold: true, size: 19 })],
              }),
            ],
          }),
        ],
      })
    );
  });

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders(), rows });
}

function totalsSection(data: InvoiceData) {
  const plainRow = (label: string, value: string) =>
    new TableRow({
      children: [
        new TableCell({
          borders: noBorders(),
          margins: { top: 60, bottom: 60 },
          children: [new Paragraph({ children: [new TextRun({ text: label, size: 19 })] })],
        }),
        new TableCell({
          borders: noBorders(),
          margins: { top: 60, bottom: 60 },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: value, size: 19 })] })],
        }),
      ],
    });

  const rows = [
    plainRow("Subtotal", formatPKR(data.subtotal)),
    plainRow("Shipping", formatPKR(data.shippingCost)),
  ];
  if (data.discount > 0) {
    rows.push(plainRow(`Discount${data.couponCode ? ` (${data.couponCode})` : ""}`, `− ${formatPKR(data.discount)}`));
  }
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: GREEN, color: "auto" },
          margins: { top: 150, bottom: 150, left: 150, right: 100 },
          borders: noBorders(),
          children: [new Paragraph({ children: [new TextRun({ text: "TOTAL (PKR)", bold: true, size: 21, color: WHITE })] })],
        }),
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: GREEN, color: "auto" },
          margins: { top: 150, bottom: 150, left: 100, right: 150 },
          borders: noBorders(),
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: formatPKR(data.total), bold: true, size: 28, color: WHITE })],
            }),
          ],
        }),
      ],
    })
  );

  const table = new Table({ width: { size: 45, type: WidthType.PERCENTAGE }, borders: noBorders(), rows, alignment: AlignmentType.RIGHT });

  return [
    table,
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 150 },
      children: [new TextRun({ text: data.amountInWords, italics: true, size: 19, color: INK_FAINT })],
    }),
  ];
}

function sectionCard(label: string, lines: Array<{ text: string; bold?: boolean; color?: string }[]>) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders(),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: CARD_BG, color: "auto" },
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
            borders: noBorders(),
            children: [
              new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: label, bold: true, size: 17, color: GREEN })] }),
              ...lines.map(
                (runs) =>
                  new Paragraph({
                    children: runs.map((r) => new TextRun({ text: r.text, bold: r.bold, color: r.color ?? INK, size: 19 })),
                  })
              ),
            ],
          }),
        ],
      }),
    ],
  });
}

export async function renderInvoiceDocx(data: InvoiceData): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [
    headerBand(data),
    accentBar(),
    new Paragraph({ spacing: { after: 200 }, children: [] }),
    cardsRow(data),
    new Paragraph({ spacing: { after: 200 }, children: [] }),
    itemsTable(data),
    new Paragraph({ spacing: { after: 150 }, children: [] }),
    ...totalsSection(data),
    new Paragraph({ spacing: { after: 150 }, children: [] }),
  ];

  if (data.bankAccount) {
    children.push(
      sectionCard("PAYMENT DETAILS", [
        [
          { text: data.paymentStatus === "unpaid" ? "Status: UNPAID" : `Status: ${data.paymentStatus.toUpperCase()}`, bold: true, color: data.paymentStatus === "unpaid" ? DESTRUCTIVE : INK },
          { text: `  —  ${data.paymentMethodLabel}` },
        ],
        [{ text: "" }],
        [{ text: "Account Title: " }, { text: data.bankAccount.accountTitle, bold: true }],
        [{ text: `Bank: ${data.bankAccount.bankName}` }],
        [{ text: "IBAN: " }, { text: data.bankAccount.iban, bold: true }],
      ])
    );
    children.push(new Paragraph({ spacing: { after: 150 }, children: [] }));
  }

  children.push(sectionCard("NOTES", [[{ text: "Warranty: ", bold: true }, { text: data.warrantyNote }]]));

  children.push(
    new Paragraph({ spacing: { before: 400, after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Thank you for shopping with INFiLL PK", bold: true, size: 21 })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "This is a computer-generated e-invoice and does not require a signature.", size: 16, color: INK_FAINT })],
    })
  );

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Arial" } },
      },
    },
    sections: [
      {
        properties: { page: { margin: { top: 0, bottom: 720, left: 720, right: 720 } } },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
