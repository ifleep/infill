import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { prisma } from "@/lib/db";
import { formatPKR } from "@/lib/format";
import { OrderDetailControls } from "@/components/admin/order-detail-controls";

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

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!order) notFound();

  const address = isShippingAddress(order.shippingAddress) ? order.shippingAddress : null;
  const customerName = order.customer?.name ?? order.guestName ?? "Guest";
  const customerEmail = order.customer?.email ?? order.guestEmail ?? "—";
  const customerPhone = order.customer?.phone ?? order.guestPhone ?? address?.phone ?? "—";

  return (
    <div>
      <Link
        href="/admin/orders"
        className="focus-ring mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Placed {order.createdAt.toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-display mb-4 text-sm font-semibold text-ink">Items</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">SKU</th>
                  <th className="pb-2 text-right font-medium">Unit price</th>
                  <th className="pb-2 text-right font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 text-ink">
                      {item.productId ? (
                        <Link href={`/admin/products/${item.productId}/edit`} className="hover:text-blue-700">
                          {item.productName}
                        </Link>
                      ) : (
                        item.productName
                      )}
                    </td>
                    <td className="tabular py-2.5 text-ink-faint">{item.sku ?? "—"}</td>
                    <td className="tabular py-2.5 text-right text-ink-muted">{formatPKR(item.unitPrice)}</td>
                    <td className="tabular py-2.5 text-right text-ink-muted">{item.quantity}</td>
                    <td className="tabular py-2.5 text-right font-medium text-ink">{formatPKR(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span>
                <span className="tabular">{formatPKR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Shipping</span>
                <span className="tabular">{formatPKR(order.shippingCost)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-ink-muted">
                  <span>Discount</span>
                  <span className="tabular">−{formatPKR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-ink">
                <span>Total</span>
                <span className="tabular">{formatPKR(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-display mb-4 text-sm font-semibold text-ink">Payment</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-ink-faint">Method</dt>
              <dd className="text-ink">{order.paymentMethod ? paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod : "—"}</dd>
              <dt className="text-ink-faint">Status</dt>
              <dd className="text-ink">{order.paymentStatus}</dd>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-display mb-4 text-sm font-semibold text-ink">Customer</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-ink-faint">Name</dt>
                <dd className="text-ink">{customerName}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-faint">Email</dt>
                <dd className="text-ink">{customerEmail}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-faint">Phone</dt>
                <dd className="text-ink">{customerPhone}</dd>
              </div>
              {order.customer && (
                <Link
                  href={`/admin/customers`}
                  className="focus-ring inline-block text-xs text-blue-700 hover:text-blue-600"
                >
                  Registered account →
                </Link>
              )}
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-display mb-4 text-sm font-semibold text-ink">Shipping address</h2>
            {address ? (
              <address className="text-sm not-italic text-ink">
                {address.fullName}
                <br />
                {address.address}
                <br />
                {address.city}
                {address.province ? `, ${address.province}` : ""}
                <br />
                Pakistan
                <br />
                <span className="text-ink-muted">{address.phone}</span>
              </address>
            ) : (
              <p className="text-sm text-ink-faint">No address on file.</p>
            )}
          </div>

          <OrderDetailControls
            orderId={order.id}
            orderNumber={order.orderNumber}
            initialStatus={order.status}
            initialPaymentStatus={order.paymentStatus}
            initialNotes={order.notes ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
