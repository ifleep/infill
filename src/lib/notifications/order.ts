import { formatPKR } from "@/lib/format";
import { getSiteSettings } from "@/lib/data/settings";
import { sendEmail } from "@/lib/notifications/email";

const BRAND_GREEN = "#0f6b3f";
const INK = "#15181d";
const INK_MUTED = "#565f6a";
const BORDER = "#e3e6ea";
const SURFACE_SUNKEN = "#f5f6f8";

interface OrderForNotification {
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string | null;
  shippingAddress: unknown;
  items: { productName: string; quantity: number; unitPrice: number; total: number }[];
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
}

function isShippingAddress(value: unknown): value is ShippingAddress {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.fullName === "string" && typeof v.address === "string" && typeof v.city === "string";
}

const paymentMethodLabels: Record<string, string> = {
  cod: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
};

// Every email in the app goes through this one wrapper, so the customer
// confirmation, the store notification, and anything added later all carry
// the same header/footer instead of each hand-rolling its own HTML.
function emailLayout(preheader: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:${SURFACE_SUNKEN};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK}">
    <span style="display:none;font-size:1px;color:${SURFACE_SUNKEN};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SURFACE_SUNKEN};padding:32px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${BORDER}">
            <tr>
              <td style="background:${BRAND_GREEN};padding:24px 32px">
                <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.3px">INFiLLPK</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px">${bodyHtml}</td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:${SURFACE_SUNKEN};border-top:1px solid ${BORDER}">
                <p style="margin:0;font-size:12px;color:${INK_MUTED};line-height:1.6">
                  INFiLLPK &middot; 3D Printing &amp; Digital Fabrication, Pakistan<br/>
                  Questions about your order? Just reply to this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function itemsTable(items: OrderForNotification["items"]): string {
  const rows = items
    .map(
      (i, idx) => `
        <tr>
          <td style="padding:12px 0;border-top:${idx === 0 ? "none" : `1px solid ${BORDER}`};font-size:14px;color:${INK}">
            ${i.productName}
            <span style="color:${INK_MUTED}"> &times; ${i.quantity}</span>
          </td>
          <td style="padding:12px 0;border-top:${idx === 0 ? "none" : `1px solid ${BORDER}`};font-size:14px;color:${INK};text-align:right;white-space:nowrap">
            ${formatPKR(i.total)}
          </td>
        </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}

function totalsBlock(order: OrderForNotification): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;border-top:1px solid ${BORDER};padding-top:12px">
      <tr>
        <td style="padding:3px 0;font-size:13px;color:${INK_MUTED}">Subtotal</td>
        <td style="padding:3px 0;font-size:13px;color:${INK_MUTED};text-align:right">${formatPKR(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:3px 0;font-size:13px;color:${INK_MUTED}">Shipping</td>
        <td style="padding:3px 0;font-size:13px;color:${INK_MUTED};text-align:right">${formatPKR(order.shippingCost)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0 0;font-size:16px;font-weight:700;color:${INK}">Total</td>
        <td style="padding:8px 0 0;font-size:16px;font-weight:700;color:${INK};text-align:right">${formatPKR(order.total)}</td>
      </tr>
    </table>`;
}

function addressBlock(address: ShippingAddress | null): string {
  if (!address) return "";
  return `
    <div style="margin-top:24px;padding:16px;background:${SURFACE_SUNKEN};border-radius:8px">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:${INK_MUTED}">Shipping to</p>
      <p style="margin:0;font-size:14px;color:${INK};line-height:1.6">
        ${address.fullName}<br/>
        ${address.address}<br/>
        ${address.city}${address.province ? `, ${address.province}` : ""}, Pakistan<br/>
        ${address.phone}
      </p>
    </div>`;
}

export async function sendOrderNotifications(order: OrderForNotification, customerEmail: string): Promise<void> {
  const settings = await getSiteSettings();
  const address = isShippingAddress(order.shippingAddress) ? order.shippingAddress : null;
  const paymentLabel = order.paymentMethod ? paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod : "—";

  const customerHtml = emailLayout(
    `Your order ${order.orderNumber} is confirmed — total ${formatPKR(order.total)}`,
    `
      <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:${INK}">Thanks for your order</h1>
      <p style="margin:0 0 24px;font-size:14px;color:${INK_MUTED}">
        Order <strong style="color:${INK}">${order.orderNumber}</strong> has been received and will be packed and shipped soon.
      </p>
      ${itemsTable(order.items)}
      ${totalsBlock(order)}
      <p style="margin:20px 0 0;font-size:13px;color:${INK_MUTED}">
        Payment method: <strong style="color:${INK}">${paymentLabel}</strong>
      </p>
      ${addressBlock(address)}
    `
  );

  const storeHtml = emailLayout(
    `New order ${order.orderNumber} — ${formatPKR(order.total)}`,
    `
      <h1 style="margin:0 0 4px;font-size:20px;font-weight:700;color:${INK}">New order: ${order.orderNumber}</h1>
      <p style="margin:0 0 24px;font-size:14px;color:${INK_MUTED}">From ${customerEmail}</p>
      ${itemsTable(order.items)}
      ${totalsBlock(order)}
      <p style="margin:20px 0 0;font-size:13px;color:${INK_MUTED}">
        Payment method: <strong style="color:${INK}">${paymentLabel}</strong>
      </p>
      ${addressBlock(address)}
    `
  );

  await Promise.all([
    sendEmail(customerEmail, `Order confirmed — ${order.orderNumber}`, customerHtml),
    settings.storeNotificationEmail
      ? sendEmail(settings.storeNotificationEmail, `New order — ${order.orderNumber}`, storeHtml)
      : Promise.resolve(),
  ]);
}
