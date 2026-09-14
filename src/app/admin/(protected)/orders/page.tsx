import { getAllOrders } from "@/lib/data/orders";
import { formatPKR } from "@/lib/format";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <h1 className="font-display mb-2 text-2xl font-semibold text-ink">Orders</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Checkout doesn&rsquo;t place real orders yet — no payment provider is connected. This list is ready for when
        one is: orders created through the store will appear here automatically.
      </p>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-medium text-ink">{o.orderNumber}</td>
                <td className="px-4 py-3 text-ink-muted">{o.customer?.name ?? o.guestName ?? o.guestEmail ?? "—"}</td>
                <td className="tabular px-4 py-3 text-ink-muted">{o.items.length}</td>
                <td className="tabular px-4 py-3 font-medium text-ink">{formatPKR(o.total)}</td>
                <td className="px-4 py-3 text-ink-muted">{o.status}</td>
                <td className="px-4 py-3 text-ink-muted">{o.paymentStatus}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-faint">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
