import type { BankAccount } from "@/lib/data/settings";

export interface InvoiceItem {
  // Already includes the variant label, e.g. "Bambu Lab A1 (Combo (AMS Lite))"
  // — see productName in createOrder (src/lib/data/orders.ts).
  description: string;
  sku: string | null;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceData {
  orderNumber: string;
  placedAt: string; // pre-formatted, e.g. "29 October 2026, 3:45 PM"
  billedToName: string;
  billedToEmail: string;
  billedToPhone: string;
  shipToName: string;
  shipToLines: string[]; // address lines, already cleaned, country appended last
  shipToPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  couponCode: string | null;
  total: number;
  amountInWords: string;
  paymentMethodLabel: string;
  paymentStatus: "unpaid" | "paid" | "refunded" | string;
  bankAccount: BankAccount | null;
  warrantyNote: string;
}
