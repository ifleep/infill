import { formatPKR } from "@/lib/format";
import { getSiteSettings } from "@/lib/data/settings";
import { sendEmail } from "@/lib/notifications/email";

interface OrderForNotification {
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string | null;
  items: { productName: string; quantity: number; unitPrice: number; total: number }[];
}

function itemsTable(items: OrderForNotification["items"]): string {
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:4px 8px">${i.productName} × ${i.quantity}</td><td style="padding:4px 8px;text-align:right">${formatPKR(i.total)}</td></tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse">${rows}</table>`;
}

export async function sendOrderNotifications(order: OrderForNotification, customerEmail: string): Promise<void> {
  const settings = await getSiteSettings();

  const customerHtml = `
    <h2>Thanks for your order, ${order.orderNumber}</h2>
    <p>We've received your order and will get it packed and shipped soon.</p>
    ${itemsTable(order.items)}
    <p>Subtotal: ${formatPKR(order.subtotal)}<br/>
    Shipping: ${formatPKR(order.shippingCost)}<br/>
    <strong>Total: ${formatPKR(order.total)}</strong></p>
    <p>Payment method: ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}</p>
  `;

  const storeHtml = `
    <h2>New order: ${order.orderNumber}</h2>
    ${itemsTable(order.items)}
    <p>Total: ${formatPKR(order.total)} · Payment: ${order.paymentMethod}</p>
    <p>Customer: ${customerEmail}</p>
  `;

  await Promise.all([
    sendEmail(customerEmail, `Order confirmed — ${order.orderNumber}`, customerHtml),
    settings.storeNotificationEmail
      ? sendEmail(settings.storeNotificationEmail, `New order — ${order.orderNumber}`, storeHtml)
      : Promise.resolve(),
  ]);
}
