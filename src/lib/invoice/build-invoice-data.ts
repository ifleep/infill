import type { Order, OrderItem, Customer } from "@/generated/prisma/client";
import type { BankAccount } from "@/lib/data/settings";
import { cleanDisplayText, cleanDisplayPhone, cleanDisplayAddressLines } from "@/lib/invoice/clean-text";
import { numberToWordsPKR } from "@/lib/invoice/number-to-words";
import type { InvoiceData } from "@/lib/invoice/types";

interface ShippingAddressShape {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
}

function isShippingAddress(value: unknown): value is ShippingAddressShape {
  return typeof value === "object" && value !== null;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
};

export function buildInvoiceData(
  order: Order & { items: OrderItem[]; customer: Customer | null },
  bankAccount: BankAccount | null
): InvoiceData {
  const address = isShippingAddress(order.shippingAddress) ? order.shippingAddress : null;

  const rawName = order.customer?.name ?? order.guestName ?? address?.fullName ?? "Customer";
  const rawEmail = order.customer?.email ?? order.guestEmail ?? "";
  const rawPhone = order.customer?.phone ?? order.guestPhone ?? address?.phone ?? "";

  const shipToName = cleanDisplayText(address?.fullName ?? rawName);
  const shipToLines = address
    ? [
        ...cleanDisplayAddressLines([address.address, [address.city, address.province].filter(Boolean).join(", ")]),
        "Pakistan",
      ]
    : [];

  return {
    orderNumber: order.orderNumber,
    placedAt: order.createdAt.toLocaleString("en-PK", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    billedToName: cleanDisplayText(rawName),
    billedToEmail: rawEmail.trim(),
    billedToPhone: cleanDisplayPhone(rawPhone),
    shipToName,
    shipToLines,
    shipToPhone: cleanDisplayPhone(address?.phone ?? rawPhone),
    items: order.items.map((item) => ({
      description: item.productName,
      sku: item.sku,
      qty: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.total,
    })),
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    discount: order.discount,
    couponCode: order.couponCode,
    total: order.total,
    amountInWords: numberToWordsPKR(order.total),
    paymentMethodLabel: order.paymentMethod
      ? (PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod)
      : "—",
    paymentStatus: order.paymentStatus,
    bankAccount,
    warrantyNote: "7 days against manufacturing defects.",
  };
}
