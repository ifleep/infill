import { getAllOrders } from "@/lib/data/orders";
import { AdminOrdersTable } from "@/components/admin/admin-orders-table";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <h1 className="font-display mb-2 text-2xl font-semibold text-ink">Orders</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Orders placed at checkout (Cash on Delivery or Bank Transfer) appear here automatically. Click an order
        number to see the full address, items and payment details.
      </p>

      <AdminOrdersTable
        initialOrders={orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          createdAt: o.createdAt.toISOString(),
          customerName: o.customer?.name ?? o.guestName ?? o.guestEmail ?? "—",
          itemCount: o.items.length,
          total: o.total,
          status: o.status,
          paymentStatus: o.paymentStatus,
        }))}
      />
    </div>
  );
}
